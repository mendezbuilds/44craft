"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { emailShell } from "@/lib/email-template";
import { projectSchema } from "@/lib/validation";
import { uploadImage, PROJECT_IMAGES_BUCKET, type UploadImageState } from "@/lib/storage";

export type ProjectFormState = { error?: string };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";

/**
 * Two upload points (cover, gallery) sharing one bucket under different
 * path prefixes for organization — same uploadImage() call either way,
 * same reasoning as team-profile-actions.ts's uploadProfilePhotoAction:
 * service-role upload rather than a browser-direct one with Storage RLS
 * policies, simpler to get right, and this is already how every
 * privileged write in this app goes through a re-checked requireAdmin()
 * server action.
 */
export async function uploadProjectCoverAction(formData: FormData): Promise<UploadImageState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose an image file." };
  return uploadImage(PROJECT_IMAGES_BUCKET, "covers", file);
}

export async function uploadProjectGalleryImageAction(formData: FormData): Promise<UploadImageState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose an image file." };
  return uploadImage(PROJECT_IMAGES_BUCKET, "gallery", file);
}

/**
 * SPEC.md Section 10's fourth trigger — "Featured in a project." Best-
 * effort, same reasoning as the approve/reject sends in
 * reviews/actions.ts: the assignment already happened, a failed email
 * shouldn't roll it back. Cover image is optional (Project.coverImage
 * can be null) — the shell's `image` param is itself optional for
 * exactly this case, so a project with no cover just renders without
 * one rather than a broken `<img>`.
 */
async function notifyFeatured(
  teamMemberIds: string[],
  projectTitle: string,
  projectSlug: string,
  coverImage: string | null,
) {
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
          statusLabel: "Featured",
          heading: "You're featured.",
          paragraphs: [`You've been added to <strong style="color:#F2EEFF;">${projectTitle}</strong> — it's live on the site now.`],
          image: coverImage ? { src: coverImage, alt: projectTitle } : undefined,
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

/** One URL per line — same pattern as deliverables (services) and body
 * text elsewhere, easier to type/paste than a JSON array or a real
 * upload flow. Empty lines dropped, no dedup (unlike tags, a gallery can
 * legitimately reuse a URL). */
function parseGallery(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description"),
    coverImage: formData.get("coverImage") ?? "",
    gallery: parseGallery(formData.get("gallery")),
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
  // Public pages too — Project has no review workflow, this is
  // immediately live, so the cached /projects index and this project's
  // own detail page need invalidating same as admin's own list does.
  // (Found missing here the same way it was found missing for Service:
  // the pages simply didn't exist yet when this action was first
  // written — flagging, not silently carrying the gap forward now that
  // it does.)
  revalidatePath("/projects");
  revalidatePath(`/projects/${rest.slug}`);
  // Brand new project — every connected member is newly featured by
  // definition, no diffing needed (contrast updateProjectAction below).
  await notifyFeatured(teamMemberIds, rest.title, rest.slug, coverImage || null);
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
  // who was already on the project. Also grabs the current slug, in case
  // this edit changes it — the old detail page's cache needs invalidating
  // too, not just the new one.
  const current = await prisma.teamProfile.findMany({ where: { projects: { some: { id } } }, select: { id: true } });
  const currentProject = await prisma.project.findUnique({ where: { id }, select: { slug: true } });
  const beforeIds = new Set(current.map((m) => m.id));
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
  revalidatePath("/projects");
  revalidatePath(`/projects/${rest.slug}`);
  if (currentProject && currentProject.slug !== rest.slug) {
    revalidatePath(`/projects/${currentProject.slug}`);
  }
  // Only whoever's newly on the project — re-saving with the same roster
  // (or removing someone) shouldn't re-notify everyone who was already
  // there.
  await notifyFeatured(newlyAdded, rest.title, rest.slug, coverImage || null);
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

  const deleted = await prisma.project.delete({ where: { id } });

  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  revalidatePath("/projects");
  revalidatePath(`/projects/${deleted.slug}`);
  return { success: "Project deleted." };
}
