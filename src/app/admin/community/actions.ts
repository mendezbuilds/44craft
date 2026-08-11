"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { communityUpdateSchema } from "@/lib/validation";

export type CommunityFormState = { error?: string };

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
  return { success: "Update deleted." };
}
