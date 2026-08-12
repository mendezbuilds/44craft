import { createAdminClient } from "@/lib/supabase/admin";

// New buckets for the project/community image upload flow — one bucket
// per content type, same as team-profile.ts's TEAM_PHOTOS_BUCKET (that
// one stays where it is; not moved here, no reason to touch working
// code). Project covers and gallery images share one bucket (same
// model, same "project asset" concept) rather than splitting further.
export const PROJECT_IMAGES_BUCKET = "project-images";
export const COMMUNITY_IMAGES_BUCKET = "community-images";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB — same limit as team-photos
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export type UploadImageState = { error?: string; url?: string };

/**
 * Shared mechanics behind every image upload action (team photos aside —
 * that one predates this file and isn't worth touching just to share
 * code with it). Each call site is still its own thin server action
 * (own auth check, own field name) — this just avoids writing the same
 * validate-then-upload-then-getPublicUrl logic three more times with
 * three chances to drift.
 */
export async function uploadImage(bucket: string, pathPrefix: string, file: File): Promise<UploadImageState> {
  if (file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Use a PNG, JPEG, WebP, or GIF." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be under 5MB." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  // No stable owner id to key the path on (unlike team photos, keyed by
  // user.id) — a brand new project/community update doesn't have an id
  // yet at upload time. Timestamp + a short random suffix keeps
  // concurrent uploads from colliding without needing one.
  const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true });

  if (uploadError) {
    return { error: "Upload failed. Try again." };
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
