"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { TEAM_PHOTOS_BUCKET, uniqueSlugFor, type ProfileSnapshot } from "@/lib/team-profile";
import { profileSnapshotSchema, changePasswordSchema } from "@/lib/validation";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export type UploadPhotoState = { error?: string; url?: string };

/**
 * Uploads via the service-role client rather than a browser-direct upload
 * with Storage RLS policies — simpler to get right, and this app already
 * funnels every privileged write through a server action that's re-checked
 * `requireUser()` first, same pattern as everywhere else.
 */
export async function uploadProfilePhotoAction(formData: FormData): Promise<UploadPhotoState> {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "Use a PNG, JPEG, WebP, or GIF." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: "Image must be under 5MB." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from(TEAM_PHOTOS_BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: "Upload failed. Try again." };
  }

  const { data } = admin.storage.from(TEAM_PHOTOS_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

export type SubmitProfileState = { error?: string; success?: boolean };

/**
 * Called directly from the guided editor (not tied to a <form action>,
 * since the wizard already collects everything into one object across
 * steps) — server actions can be plain async functions, they don't have
 * to take FormData.
 *
 * Writes the same snapshot to both the top-level columns (the member's own
 * "current working copy", read back to pre-fill the editor on re-open) and
 * pendingVersion (what the admin reviews). publishedVersion is untouched
 * here — it only changes on approval, so the public site keeps showing the
 * last-approved content until then, never this draft.
 */
export async function submitProfileAction(input: unknown): Promise<SubmitProfileState> {
  const user = await requireUser();

  const parsed = profileSnapshotSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const snapshot: ProfileSnapshot = parsed.data;

  const existing = await prisma.teamProfile.findUnique({ where: { userId: user.id } });
  const slug = await uniqueSlugFor(snapshot.name, existing?.id);

  const profile = await prisma.teamProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      slug,
      name: snapshot.name,
      roleTitle: snapshot.roleTitle,
      photo: snapshot.photo,
      bio: snapshot.bio,
      skills: snapshot.skills,
      socials: snapshot.socials,
      status: "pending",
      pendingVersion: snapshot,
    },
    update: {
      slug,
      name: snapshot.name,
      roleTitle: snapshot.roleTitle,
      photo: snapshot.photo,
      bio: snapshot.bio,
      skills: snapshot.skills,
      socials: snapshot.socials,
      status: "pending",
      pendingVersion: snapshot,
    },
  });

  await prisma.profileActivity.create({
    data: { teamProfileId: profile.id, type: "submitted" },
  });

  return { success: true };
}

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  await requireUser();

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: "Could not update your password. Try again." };
  }

  return { success: true };
}
