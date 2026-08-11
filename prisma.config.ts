import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js loads .env.local automatically for the app; the Prisma CLI does
// not, so load it here explicitly (no-op if the file doesn't exist, e.g.
// in CI/deploy environments where vars are injected directly).
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Migrate needs a direct (non-pooled) connection — Supabase's pooled
  // DATABASE_URL runs through pgbouncer in transaction mode, which doesn't
  // support the advisory locks Migrate uses. The app's PrismaClient (see
  // src/lib/prisma.ts) uses the pooled DATABASE_URL instead.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
