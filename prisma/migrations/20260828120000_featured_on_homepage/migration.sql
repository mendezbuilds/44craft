-- Hand-authored, not `prisma migrate dev` — the shadow database Prisma
-- spins up to validate/diff migrations can't replay the earlier
-- 20260827120000_enable_rls_policies migration (it references Supabase's
-- `auth` schema, which only exists on the real project database, not a
-- fresh shadow DB). Applied instead via `prisma migrate deploy`, which
-- runs pending migrations directly against DATABASE_URL with no shadow
-- DB involved. Plain additive columns, safe to run once.

ALTER TABLE "team_profiles" ADD COLUMN "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "team_profiles" ADD COLUMN "featuredAt" TIMESTAMP(3);
