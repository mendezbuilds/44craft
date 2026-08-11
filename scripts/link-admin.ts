// Env vars come from Node's --env-file flag (see the npm script), not a
// dotenv import here — `import` is hoisted above regular statements, so a
// dotenv.config() call in this position would run after lib/prisma.ts has
// already read (and cached) process.env.DATABASE_URL as undefined.
import { prisma } from "../src/lib/prisma";
import { createAdminClient } from "../src/lib/supabase/admin";

/**
 * Links a Supabase Auth user (created manually in the dashboard) as the
 * bootstrap admin: stamps app_metadata.role=admin and creates the matching
 * Prisma User row. Alternative to seed-admin.ts for when the account was
 * already created directly in Supabase.
 */
async function main() {
  const email = process.env.LINK_ADMIN_EMAIL;
  if (!email) {
    throw new Error("Set LINK_ADMIN_EMAIL before running this script.");
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existingAdmin) {
    throw new Error(
      `An admin account already exists (${existingAdmin.email}). Refusing to link another.`,
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw new Error(`Failed to list Supabase users: ${error.message}`);

  const authUser = data.users.find((u) => u.email === email);
  if (!authUser) {
    throw new Error(`No Supabase Auth user found with email ${email}.`);
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(authUser.id, {
    app_metadata: { role: "admin" },
  });
  if (updateError) {
    throw new Error(`Failed to set admin role: ${updateError.message}`);
  }

  await prisma.user.upsert({
    where: { id: authUser.id },
    update: { role: "admin" },
    create: { id: authUser.id, email, role: "admin" },
  });

  console.log(`${email} is now an admin. Sign in at /signin.`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
