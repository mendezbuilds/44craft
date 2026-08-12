// Env vars come from Node's --env-file flag (see the npm script), not a
// dotenv import — see scripts/seed-admin.ts for why.
import { createAdminClient } from "../src/lib/supabase/admin";
import { TEAM_PHOTOS_BUCKET } from "../src/lib/team-profile";
import { PROJECT_IMAGES_BUCKET, COMMUNITY_IMAGES_BUCKET, ALLOWED_IMAGE_TYPES } from "../src/lib/storage";

// "5MB" (Supabase's own size-string format), not MAX_IMAGE_BYTES's raw
// byte count — matches the exact format the original team-photos bucket
// was already successfully created with; not worth risking a different
// parse path for a string-vs-number distinction with no real upside.
const FILE_SIZE_LIMIT = "5MB";

const BUCKETS = [TEAM_PHOTOS_BUCKET, PROJECT_IMAGES_BUCKET, COMMUNITY_IMAGES_BUCKET];

/**
 * Idempotent — safe to re-run. Creates every public bucket the app's
 * upload actions write to (team-profile-actions.ts for team-photos;
 * admin/projects and admin/community's upload actions for the other two)
 * if they don't already exist. Public so uploaded images can be used
 * directly in <Image> without signed URLs.
 */
async function main() {
  const admin = createAdminClient();

  const { data: existingBuckets, error: listError } = await admin.storage.listBuckets();
  if (listError) throw new Error(`Failed to list buckets: ${listError.message}`);
  const existingNames = new Set(existingBuckets.map((b) => b.name));

  for (const bucket of BUCKETS) {
    if (existingNames.has(bucket)) {
      console.log(`Bucket "${bucket}" already exists — nothing to do.`);
      continue;
    }

    const { error: createError } = await admin.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: FILE_SIZE_LIMIT,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    });

    if (createError) throw new Error(`Failed to create bucket "${bucket}": ${createError.message}`);
    console.log(`Created public bucket "${bucket}".`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});
