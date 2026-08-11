// Env vars come from Node's --env-file flag (see the npm script), not a
// dotenv import here — `import` is hoisted above regular statements, so a
// dotenv.config() call in this position would run after lib/prisma.ts has
// already read (and cached) process.env.DATABASE_URL as undefined.
import { prisma } from "../src/lib/prisma";
import { createAdminClient } from "../src/lib/supabase/admin";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local before running this script.",
    );
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existingAdmin) {
    throw new Error(
      `An admin account already exists (${existingAdmin.email}). Refusing to seed another.`,
    );
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create Supabase Auth user: ${error?.message}`);
  }

  await prisma.user.create({
    data: { id: data.user.id, email, role: "admin" },
  });

  console.log(`Admin account created for ${email}. You can now sign in at /signin.`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
