"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type ToggleUserStatusState = { error?: string; success?: string };

/** Toggles a member's account between active/deactivated. Two layers,
 * matching this app's existing "layered auth check" pattern (README):
 * `getCurrentUser()` already rejects a deactivated user's *existing*
 * session on their very next request, but signInWithPassword() itself
 * doesn't know about our own `status` column and would still hand out a
 * fresh valid session — so this also bans the account at the Supabase
 * Auth layer itself (`ban_duration`), the platform's own equivalent of
 * "can't sign in", and signInAction rejects+signs-out a banned account
 * up front with a real message instead of a confusing silent bounce.
 *
 * Deliberately untouched: their row, profile, and project credits —
 * this is account-access control, not a content takedown. The
 * published profile stays visible on the public site.
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

  const admin = createAdminClient();
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: nextStatus === "deactivated" ? "876000h" : "none", // ~100 years / lifted
  });
  if (banError) {
    return { error: `Couldn't update the account's sign-in access: ${banError.message}` };
  }

  await prisma.user.update({ where: { id: userId }, data: { status: nextStatus } });

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${userId}`);
  return { success: nextStatus === "deactivated" ? "Account deactivated." : "Account reactivated." };
}

export type DeleteTeamMemberState = { error?: string; success?: string };

/**
 * Removes a team member entirely — auth account, `users` row,
 * `team_profiles` row, `profile_activity` history, and their entries in
 * every project's team-member list. Only the auth deletion and the
 * `users` row delete are explicit; everything else cascades from the
 * `users` row delete via `ON DELETE CASCADE` already in place on
 * `team_profiles.userId`, `profile_activity.teamProfileId`, and the
 * implicit `_ProjectToTeamProfile` join table (see the migrations that
 * created each) — a project simply stops listing this person once their
 * team_profiles row is gone, no separate step needed.
 *
 * Auth account deleted *first*, deliberately: if that fails, nothing
 * else has happened yet and it's safe to just report the error. If the
 * (much less likely) Prisma delete fails after a successful auth
 * deletion, the admin is told to retry rather than the failure being
 * silently swallowed — this is a destructive action, not a best-effort
 * side effect like an email send.
 */
export async function deleteTeamMemberAction(
  _prevState: DeleteTeamMemberState,
  formData: FormData,
): Promise<DeleteTeamMemberState> {
  await requireAdmin();
  const profileId = formData.get("profileId");
  const confirmName = formData.get("confirmName");
  if (typeof profileId !== "string") return { error: "Missing profile id." };

  const profile = await prisma.teamProfile.findUnique({
    where: { id: profileId },
    include: { user: { select: { id: true } }, projects: { select: { slug: true } } },
  });
  if (!profile) return { error: "Team member not found." };

  // Re-checked server-side, not just trusted from the client's enabled/
  // disabled button state — the whole point of "type their name" is that
  // it's a deliberate, verified action, not just extra clicks.
  if (typeof confirmName !== "string" || confirmName.trim() !== profile.name) {
    return { error: "Name didn't match — nothing was deleted." };
  }

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.deleteUser(profile.user.id);
  if (authError) {
    return { error: `Couldn't delete the auth account, nothing else was touched: ${authError.message}` };
  }

  try {
    await prisma.user.delete({ where: { id: profile.user.id } });
  } catch {
    return {
      error:
        "The auth account was deleted, but removing their database record failed — retry, or clean up manually.",
    };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin");
  revalidatePath("/team");
  if (profile.hasBeenPublished) {
    revalidatePath("/"); // homepage team teaser
  }
  revalidatePath("/projects");
  for (const project of profile.projects) {
    revalidatePath(`/projects/${project.slug}`);
  }

  return { success: `${profile.name} was deleted.` };
}
