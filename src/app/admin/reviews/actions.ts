"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { emailShell } from "@/lib/email-template";
import { rejectProfileSchema } from "@/lib/validation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";

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

  const profile = await prisma.teamProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
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

  // Best-effort — the profile is already live either way, so a failed
  // send here shouldn't block or roll back the approval itself.
  await resend.emails.send({
    from: EMAIL_FROM,
    to: profile.user.email,
    subject: "Your profile is live",
    html: emailShell({
      preheader: "Your 44Craft profile just went live.",
      heading: "You're live.",
      paragraphs: ["Your profile just went live on the 44Craft site — go take a look."],
      ctaLabel: "View your profile",
      ctaUrl: `${APP_URL}/team/${profile.slug}`,
    }),
  });

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

  const profile = await prisma.teamProfile.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
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

  // Best-effort, same reasoning as approveProfileAction above — the
  // status change already happened and is what the member sees on their
  // dashboard either way.
  await resend.emails.send({
    from: EMAIL_FROM,
    to: profile.user.email,
    subject: "A few tweaks needed on your profile",
    html: emailShell({
      preheader: "An admin left a note on your profile.",
      heading: "A few tweaks needed.",
      paragraphs: [
        "An admin reviewed your profile and asked for a couple of changes before it can go live:",
        `<span style="color:#F2EEFF;font-style:italic;">"${note.replace(/</g, "&lt;")}"</span>`,
        "Update your profile and resubmit whenever you're ready.",
      ],
      ctaLabel: "Edit your profile",
      ctaUrl: `${APP_URL}/dashboard/profile`,
    }),
  });

  return {};
}
