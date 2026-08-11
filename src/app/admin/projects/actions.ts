"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { emailShell } from "@/lib/email-template";
import { projectSchema } from "@/lib/validation";

export type ProjectFormState = { error?: string };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";

/**
 * SPEC.md Section 10's fourth trigger — "Featured in a project" — never
 * had a send site at all before this. Best-effort, same reasoning as the
 * approve/reject sends in reviews/actions.ts: the assignment already
 * happened, a failed email shouldn't roll it back.
 */
async function notifyFeatured(teamMemberIds: string[], projectTitle: string, projectSlug: string) {
  if (teamMemberIds.length === 0) return;

  const members = await prisma.teamProfile.findMany({
    where: { id: { in: teamMemberIds } },
    select: { user: { select: { email: true } } },
  });

  await Promise.all(
    members.map((member) =>
      resend.emails.send({
        from: EMAIL_FROM,
        to: member.user.email,
        subject: `You've been added to ${projectTitle}`,
        html: emailShell({
          preheader: `You've been featured on ${projectTitle}.`,
          heading: "You're featured.",
          paragraphs: [`You've been added to <strong style="color:#F2EEFF;">${projectTitle}</strong> on the 44Craft site.`],
          ctaLabel: "View the project",
          ctaUrl: `${APP_URL}/projects/${projectSlug}`,
        }),
      }),
    ),
  );
}

/** Comma-separated free text is friendlier to type than a real tag
 * picker for a first CRUD pass — split/trim/dedupe server-side. */
function parseTags(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return [];
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
}

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    coverImage: formData.get("coverImage") ?? "",
    tags: parseTags(formData.get("tags")),
    liveUrl: formData.get("liveUrl") ?? "",
    teamMemberIds: formData.getAll("teamMemberIds").filter((v): v is string => typeof v === "string"),
  });
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form for errors." };
  }
  const { teamMemberIds, coverImage, liveUrl, ...rest } = parsed.data;

  const existing = await prisma.project.findUnique({ where: { slug: rest.slug } });
  if (existing) return { error: "That slug is already in use." };

  await prisma.project.create({
    data: {
      ...rest,
      coverImage: coverImage || null,
      liveUrl: liveUrl || null,
      teamMembers: { connect: teamMemberIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  // Brand new project — every connected member is newly featured by
  // definition, no diffing needed (contrast updateProjectAction below).
  await notifyFeatured(teamMemberIds, rest.title, rest.slug);
  // redirect() unmounts the form before any returned state could reach it,
  // so success feedback rides along as a query param instead — picked up
  // by <ToastFromQuery> on the list page (see toast-from-query.tsx).
  redirect("/admin/projects?toast=created");
}

export async function updateProjectAction(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing project id." };

  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form for errors." };
  }
  const { teamMemberIds, coverImage, liveUrl, ...rest } = parsed.data;

  const existing = await prisma.project.findUnique({ where: { slug: rest.slug } });
  if (existing && existing.id !== id) return { error: "That slug is already in use." };

  // Roster before this update, fetched unconditionally (the slug lookup
  // above only returns a row when that slug is taken, which isn't
  // guaranteed if the admin changed it) — diffed against the incoming
  // list so only newly-added members get notified below, not everyone
  // who was already on the project.
  const before = await prisma.teamProfile.findMany({ where: { projects: { some: { id } } }, select: { id: true } });
  const beforeIds = new Set(before.map((m) => m.id));
  const newlyAdded = teamMemberIds.filter((mid) => !beforeIds.has(mid));

  await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      coverImage: coverImage || null,
      liveUrl: liveUrl || null,
      teamMembers: { set: teamMemberIds.map((mid) => ({ id: mid })) },
    },
  });

  revalidatePath("/admin/projects");
  // Only whoever's newly on the project — re-saving with the same roster
  // (or removing someone) shouldn't re-notify everyone who was already
  // there.
  await notifyFeatured(newlyAdded, rest.title, rest.slug);
  redirect("/admin/projects?toast=updated");
}

export type DeleteProjectState = { error?: string; success?: string };

export async function deleteProjectAction(
  _prevState: DeleteProjectState,
  formData: FormData,
): Promise<DeleteProjectState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing project id." };

  await prisma.project.delete({ where: { id } });

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  return { success: "Project deleted." };
}
