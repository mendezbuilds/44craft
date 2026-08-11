"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { rejectProfileSchema } from "@/lib/validation";

export type RejectProfileState = { error?: string };
export type ApproveProfileState = { error?: string; success?: string };

/**
 * publishedVersion becomes the pendingVersion snapshot — that's the whole
 * approval: what was under review is now what the public site shows.
 * pendingVersion clears since there's nothing left awaiting review.
 *
 * Returns state (was a plain void FormData action) so the row's client
 * button can show a loading spinner, a small gold particle-burst echo of
 * the public spark-burst language, and toast the result — see
 * approve-button.tsx.
 */
export async function approveProfileAction(
  _prevState: ApproveProfileState,
  formData: FormData,
): Promise<ApproveProfileState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing profile id." };

  const profile = await prisma.teamProfile.findUnique({ where: { id } });
  if (!profile || profile.status !== "pending") {
    return { error: "This profile is no longer pending." };
  }

  await prisma.$transaction([
    prisma.teamProfile.update({
      where: { id },
      data: {
        status: "published",
        hasBeenPublished: true,
        publishedVersion: profile.pendingVersion ?? undefined,
        pendingVersion: Prisma.DbNull,
      },
    }),
    prisma.profileActivity.create({
      data: { teamProfileId: id, type: "approved" },
    }),
  ]);

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  revalidatePath("/team");
  revalidatePath(`/team/${profile.slug}`);
  revalidatePath("/"); // homepage team teaser reads the same query
  return { success: `${profile.name}'s profile is live.` };
}

/**
 * Sends it back to draft with a note — SPEC.md's ProfileStatus only has
 * three values (draft/pending/published), no dedicated "rejected" state,
 * so "changes requested" is draft + a note (see ProfileActivity.note)
 * rather than a fourth status. The note is required (per the Phase 6
 * brief) since it's what shows up on the member's dashboard status card —
 * a reject with no explanation leaves them stuck.
 */
export async function rejectProfileAction(
  _prevState: RejectProfileState,
  formData: FormData,
): Promise<RejectProfileState> {
  await requireAdmin();

  const parsed = rejectProfileSchema.safeParse({
    id: formData.get("id"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "A note is required." };
  }
  const { id, note } = parsed.data;

  const profile = await prisma.teamProfile.findUnique({ where: { id } });
  if (!profile || profile.status !== "pending") {
    return { error: "This profile is no longer pending." };
  }

  await prisma.$transaction([
    prisma.teamProfile.update({
      where: { id },
      data: { status: "draft", pendingVersion: Prisma.DbNull },
    }),
    prisma.profileActivity.create({
      data: { teamProfileId: id, type: "changes_requested", note },
    }),
  ]);

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  return {};
}
