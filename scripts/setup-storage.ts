// Env vars come from Node's --env-file flag (see the npm script), not a
// dotenv import — see scripts/seed-admin.ts for why.
import { createAdminClient } from "../src/lib/supabase/admin";
import { TEAM_PHOTOS_BUCKET } from "../src/lib/team-profile";

/**
 * Idempotent — safe to re-run. Creates the public bucket profile photo
 * uploads go to (src/lib/team-profile-actions.ts) if it doesn't already
 * exist. Public so uploaded photos can be used directly in <Image> on the
 * public /team pages without signed URLs.
 */
async function main() {
  const admin = createAdminClient();

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) throw new Error(`Failed to list buckets: ${listError.message}`);

  if (buckets.some((b) => b.name === TEAM_PHOTOS_BUCKET)) {
    console.log(`Bucket "${TEAM_PHOTOS_BUCKET}" already exists — nothing to do.`);
    return;
  }

  const { error: createError } = await admin.storage.createBucket(TEAM_PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (createError) throw new Error(`Failed to create bucket: ${createError.message}`);

  console.log(`Created public bucket "${TEAM_PHOTOS_BUCKET}".`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});
