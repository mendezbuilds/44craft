"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validation";

export type ProjectFormState = { error?: string };

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
