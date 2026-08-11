"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type ToggleUserStatusState = { error?: string; success?: string };

/** Toggles a member's account between active/deactivated — deactivated
 * users can no longer sign in (see getCurrentUser in lib/auth.ts) but
 * their published profile stays visible on the public site; this is an
 * account-access control, not a content takedown.
 *
 * Returns state (was void) so the toggle button can show a loading
 * spinner and toast the result. */
export async function toggleUserStatusAction(
  _prevState: ToggleUserStatusState,
  formData: FormData,
): Promise<ToggleUserStatusState> {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string") return { error: "Missing user id." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Account not found." };

  const nextStatus = user.status === "active" ? "deactivated" : "active";
  await prisma.user.update({ where: { id: userId }, data: { status: nextStatus } });

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${userId}`);
  return { success: nextStatus === "deactivated" ? "Account deactivated." : "Account reactivated." };
}
