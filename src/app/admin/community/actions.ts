"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { communityUpdateSchema } from "@/lib/validation";
import { uploadImage, COMMUNITY_IMAGES_BUCKET, type UploadImageState } from "@/lib/storage";

export type CommunityFormState = { error?: string };

/** Same reasoning as the project cover/gallery upload actions — see
 * their comment in admin/projects/actions.ts. */
export async function uploadCommunityImageAction(formData: FormData): Promise<UploadImageState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose an image file." };
  return uploadImage(COMMUNITY_IMAGES_BUCKET, "updates", file);
}

function parseCommunityForm(formData: FormData) {
  return communityUpdateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    date: formData.get("date"),
    image: formData.get("image") ?? "",
  });
}

export async function createCommunityUpdateAction(
  _prevState: CommunityFormState,
  formData: FormData,
): Promise<CommunityFormState> {
  await requireAdmin();
  const parsed = parseCommunityForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form for errors." };
  }
  const { date, image, ...rest } = parsed.data;
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return { error: "Enter a valid date." };

  await prisma.communityUpdate.create({ data: { ...rest, date: parsedDate, image: image || null } });

  revalidatePath("/admin/community");
  // Public feed too — CommunityUpdate has no review workflow, this is
  // immediately live. Same gap as Service/Project had (the public
  // /community page didn't exist yet when this action was first written).
  revalidatePath("/community");
  redirect("/admin/community?toast=created");
}

export async function updateCommunityUpdateAction(
  _prevState: CommunityFormState,
  formData: FormData,
): Promise<CommunityFormState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing update id." };

  const parsed = parseCommunityForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form for errors." };
  }
  const { date, image, ...rest } = parsed.data;
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return { error: "Enter a valid date." };

  await prisma.communityUpdate.update({
    where: { id },
    data: { ...rest, date: parsedDate, image: image || null },
  });

  revalidatePath("/admin/community");
  revalidatePath("/community");
  redirect("/admin/community?toast=updated");
}

export type DeleteCommunityUpdateState = { error?: string; success?: string };

export async function deleteCommunityUpdateAction(
  _prevState: DeleteCommunityUpdateState,
  formData: FormData,
): Promise<DeleteCommunityUpdateState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing update id." };

  await prisma.communityUpdate.delete({ where: { id } });

  revalidatePath("/admin/community");
  revalidatePath("/community");
  return { success: "Update deleted." };
}
