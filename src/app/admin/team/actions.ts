"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendChangesRequestedEmail } from "@/lib/notifications";
import { rejectProfileSchema } from "@/lib/validation";

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
 * Deactivating also unpublishes their profile (`hasBeenPublished` ->
 * false), pulling them off the public /team grid and homepage teaser —
 * their row, content snapshots, skills, and project credits are all
 * left completely untouched, only the "show this on the public site"
 * flag flips. Reactivating deliberately does *not* flip it back:
 * whoever comes back needs a real admin decision that their (possibly
 * now-stale) info should go public again, not an automatic side effect
 * of restoring login access — see republishProfileAction below, the
 * only thing that can set it back to true once this has unset it.
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { teamProfile: { select: { id: true, slug: true, hasBeenPublished: true } } },
  });
  if (!user) return { error: "Account not found." };

  const nextStatus = user.status === "active" ? "deactivated" : "active";

  const admin = createAdminClient();
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: nextStatus === "deactivated" ? "876000h" : "none", // ~100 years / lifted
  });
  if (banError) {
    return { error: `Couldn't update the account's sign-in access: ${banError.message}` };
  }

  const willUnpublish = nextStatus === "deactivated" && user.teamProfile?.hasBeenPublished;

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: nextStatus } }),
    ...(willUnpublish
      ? [prisma.teamProfile.update({ where: { id: user.teamProfile!.id }, data: { hasBeenPublished: false } })]
      : []),
  ]);

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${userId}`);
  if (willUnpublish) {
    revalidatePath("/team");
    revalidatePath(`/team/${user.teamProfile!.slug}`);
    revalidatePath("/"); // homepage team teaser reads the same query
  }

  return {
    success:
      nextStatus === "deactivated"
        ? willUnpublish
          ? "Account deactivated and profile pulled off the public site."
          : "Account deactivated."
        : "Account reactivated — profile stays unpublished until you republish it.",
  };
}

export type RepublishProfileState = { error?: string; success?: string };

/**
 * The only path back to `hasBeenPublished: true` once deactivation has
 * cleared it — a deliberate, separate admin action rather than an
 * automatic side effect of reactivating the account, since the content
 * may be stale by the time someone comes back. Doesn't touch content at
 * all, just the visibility flag; if their info genuinely needs updating
 * first, that's the normal edit-and-resubmit flow, unrelated to this.
 */
export async function republishProfileAction(
  _prevState: RepublishProfileState,
  formData: FormData,
): Promise<RepublishProfileState> {
  await requireAdmin();
  const profileId = formData.get("profileId");
  if (typeof profileId !== "string") return { error: "Missing profile id." };

  const profile = await prisma.teamProfile.findUnique({
    where: { id: profileId },
    include: { user: { select: { status: true } } },
  });
  if (!profile) return { error: "Team member not found." };
  if (profile.user.status !== "active") {
    return { error: "Reactivate their account before republishing." };
  }
  if (!profile.publishedVersion) {
    return { error: "This profile has never been published — nothing to republish." };
  }
  if (profile.hasBeenPublished) return { error: "Already public." };

  await prisma.teamProfile.update({ where: { id: profileId }, data: { hasBeenPublished: true } });

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${profileId}`);
  revalidatePath("/team");
  revalidatePath(`/team/${profile.slug}`);
  revalidatePath("/");

  return { success: `${profile.name}'s profile is public again.` };
}

export type UnpublishProfileState = { error?: string; success?: string };

/**
 * The standalone counterpart to toggleUserStatusAction's unpublish side
 * effect — same mechanism (hasBeenPublished -> false), triggered on its
 * own instead of bundled with deactivating the account. For "hide this
 * profile without locking them out" (on leave, a stale photo needs
 * pulling, whatever) — sign-in and the account's `status` are completely
 * untouched. republishProfileAction already handles bringing it back
 * (it only checks the account is active and a publishedVersion exists —
 * both already true here), so nothing new was needed on that side.
 */
export async function unpublishProfileAction(
  _prevState: UnpublishProfileState,
  formData: FormData,
): Promise<UnpublishProfileState> {
  await requireAdmin();
  const profileId = formData.get("profileId");
  if (typeof profileId !== "string") return { error: "Missing profile id." };

  const profile = await prisma.teamProfile.findUnique({ where: { id: profileId } });
  if (!profile) return { error: "Team member not found." };
  if (!profile.hasBeenPublished) return { error: "Already not public." };

  await prisma.teamProfile.update({ where: { id: profileId }, data: { hasBeenPublished: false } });

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${profileId}`);
  revalidatePath("/team");
  revalidatePath(`/team/${profile.slug}`);
  revalidatePath("/");

  return { success: `${profile.name}'s profile is off the public site.` };
}

export type RequestProfileUpdateState = { error?: string; success?: string };

/**
 * The proactive counterpart to rejectProfileAction — same "changes
 * requested" trigger/email/dashboard note, but for when there's no
 * pending submission to reject in the first place ("please add a bio,"
 * "your photo's missing"). Guarded against a genuinely pending edit
 * exactly *because* that case already has its own, more complete
 * handling (rejectProfileAction also clears pendingVersion) — routing
 * that case through here instead would leave a rejected pendingVersion
 * sitting around unrelated to the new note.
 *
 * status -> draft is what makes the member's dashboard actually show
 * this note (StatusCard/dashboard's changesRequestedNote lookup is
 * gated on status === "draft", the same condition a real rejection
 * leaves behind) — public visibility is unaffected either way, that's
 * driven by hasBeenPublished, not status.
 */
export async function requestProfileUpdateAction(
  _prevState: RequestProfileUpdateState,
  formData: FormData,
): Promise<RequestProfileUpdateState> {
  await requireAdmin();

  const parsed = rejectProfileSchema.safeParse({
    id: formData.get("profileId"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "A note is required." };
  }
  const { id, note } = parsed.data;

  const profile = await prisma.teamProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!profile) return { error: "Team member not found." };
  if (profile.status === "pending") {
    return { error: "They already have a pending edit — reject that from /admin/reviews instead." };
  }

  await prisma.$transaction([
    prisma.teamProfile.update({ where: { id }, data: { status: "draft" } }),
    prisma.profileActivity.create({ data: { teamProfileId: id, type: "changes_requested", note } }),
  ]);

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${id}`);

  await sendChangesRequestedEmail(profile.user.email, note);

  return { success: `Update requested from ${profile.name}.` };
}

export type ToggleFeaturedState = { error?: string; success?: string };

/**
 * The homepage teaser used to just take the first 8 published profiles
 * with no real admin choice involved. `featuredAt` (not just a bare
 * boolean) records *when* this was flipped on, so "most recent first"
 * (lib/team-profile.ts's getFeaturedTeamProfiles — no cap on count, by
 * request) has something meaningful to order by that doesn't reshuffle
 * every time a featured
 * member edits unrelated content, the way reusing `updatedAt` would.
 */
export async function toggleFeaturedAction(
  _prevState: ToggleFeaturedState,
  formData: FormData,
): Promise<ToggleFeaturedState> {
  await requireAdmin();
  const profileId = formData.get("profileId");
  if (typeof profileId !== "string") return { error: "Missing profile id." };

  const profile = await prisma.teamProfile.findUnique({ where: { id: profileId } });
  if (!profile) return { error: "Team member not found." };

  const next = !profile.featuredOnHomepage;
  await prisma.teamProfile.update({
    where: { id: profileId },
    data: { featuredOnHomepage: next, featuredAt: next ? new Date() : profile.featuredAt },
  });

  revalidatePath("/admin/team");
  revalidatePath(`/admin/team/${profileId}`);
  revalidatePath("/"); // homepage teaser reads this

  return { success: next ? `${profile.name} is featured on the homepage.` : `${profile.name} is off the homepage teaser.` };
}

export type SetAdminRoleState = { error?: string; success?: string };

/**
 * Promote/demote, gated the same way as delete — a real privilege
 * change deserves the same "type their name" friction, not a bare
 * toggle a misclick could hit. Both write role in two places (the
 * established dual pattern everywhere role is set — seed-admin.ts,
 * link-admin.ts, invite acceptance): the Prisma `users.role` column
 * used for relational queries, and Supabase auth `app_metadata.role`,
 * which is what proxy.ts's fast redirect actually reads.
 *
 * Demotion additionally refuses to drop the last admin — checked as a
 * live count immediately before the write, not cached, so two admins
 * demoting each other back-to-back can't both slip through a stale
 * count.
 */
export async function promoteToAdminAction(
  _prevState: SetAdminRoleState,
  formData: FormData,
): Promise<SetAdminRoleState> {
  await requireAdmin();
  const userId = formData.get("userId");
  const confirmName = formData.get("confirmName");
  if (typeof userId !== "string") return { error: "Missing user id." };

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { teamProfile: { select: { id: true, name: true } } } });
  if (!user) return { error: "Account not found." };
  if (user.role === "admin") return { error: "Already an admin." };

  const expectedName = user.teamProfile?.name ?? user.email;
  if (typeof confirmName !== "string" || confirmName.trim() !== expectedName) {
    return { error: "Name didn't match — nothing changed." };
  }

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, { app_metadata: { role: "admin" } });
  if (authError) return { error: `Couldn't update sign-in role: ${authError.message}` };

  await prisma.user.update({ where: { id: userId }, data: { role: "admin" } });

  revalidatePath("/admin/team");
  if (user.teamProfile) revalidatePath(`/admin/team/${user.teamProfile.id}`);
  return { success: `${expectedName} is now an admin.` };
}

export async function demoteToTeamAction(
  _prevState: SetAdminRoleState,
  formData: FormData,
): Promise<SetAdminRoleState> {
  await requireAdmin();
  const userId = formData.get("userId");
  const confirmName = formData.get("confirmName");
  if (typeof userId !== "string") return { error: "Missing user id." };

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { teamProfile: { select: { id: true, name: true } } } });
  if (!user) return { error: "Account not found." };
  if (user.role !== "admin") return { error: "Not currently an admin." };

  const expectedName = user.teamProfile?.name ?? user.email;
  if (typeof confirmName !== "string" || confirmName.trim() !== expectedName) {
    return { error: "Name didn't match — nothing changed." };
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  if (adminCount <= 1) {
    return { error: "Can't remove the last admin — promote someone else first." };
  }

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, { app_metadata: { role: "team" } });
  if (authError) return { error: `Couldn't update sign-in role: ${authError.message}` };

  await prisma.user.update({ where: { id: userId }, data: { role: "team" } });

  revalidatePath("/admin/team");
  if (user.teamProfile) revalidatePath(`/admin/team/${user.teamProfile.id}`);
  return { success: `${expectedName} is no longer an admin.` };
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
