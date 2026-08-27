-- Enable Row Level Security on every table + write policies matching
-- SPEC.md's access model. Hand-authored (not `prisma migrate dev`) because
-- RLS/policies are invisible to Prisma's schema — this is the established,
-- documented pattern for RLS-with-Prisma-on-Supabase.
--
-- Safe to run more than once — every CREATE POLICY is preceded by a
-- matching DROP POLICY IF EXISTS, and the function uses CREATE OR
-- REPLACE, in case this needs retrying after a partial failure.
--
-- Why this doesn't touch the app's own behavior: every write this app
-- makes goes through Prisma using the `postgres` role (DATABASE_URL/
-- DIRECT_URL), and Storage uploads use the service-role key — both are
-- Supabase defaults with BYPASSRLS, so none of this changes what the app
-- itself can do. This closes off direct access via the public anon key
-- against Supabase's auto-generated REST API (PostgREST), which exposes
-- every table by default regardless of whether your own app ever queries
-- it that way.
--
-- IMPORTANT — before running this: confirm the role in your DATABASE_URL/
-- DIRECT_URL actually has BYPASSRLS. Standard Supabase projects grant this
-- to the `postgres` role by default, but if this project's connection
-- role was ever changed or restricted, enabling RLS here could suddenly
-- block the app's own Prisma queries instead of just the anon-key path.
-- Quick check, run this first and confirm `rolbypassrls` is true:
--
--   SELECT rolname, rolbypassrls FROM pg_roles
--   WHERE rolname = current_user;
--
-- If that comes back false, stop and say so before running the rest —
-- the fix at that point is different (grant BYPASSRLS to that role, not
-- adjust these policies).

-- ============================================================
-- Helper: is_admin() — SECURITY DEFINER so its own lookup against
-- `users` bypasses that table's RLS instead of recursing into it (the
-- standard Supabase pattern for a role-check helper). search_path is
-- pinned explicitly — an unpinned search_path on a SECURITY DEFINER
-- function is a known privilege-escalation vector if a caller could ever
-- get a malicious object earlier in their own search_path resolved
-- instead of the intended public.users.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()::text
    AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ============================================================
-- users
-- Read/update own row; admin reads/writes all.
--
-- Deviation from the literal brief, flagged rather than silently
-- shipped: "update only their own row" is implemented as *admin-only*
-- for UPDATE, not self-service. A plain "own row" UPDATE policy doesn't
-- restrict which *columns* change — a team member could PATCH their own
-- `role` from 'team' to 'admin' directly through PostgREST with their
-- own JWT, a real privilege-escalation path. Blocking that correctly
-- needs a WITH CHECK that pins role/status to their prior values, which
-- isn't something to get subtly wrong on a security migration I can't
-- test against a live connection before you run it. The app has no
-- self-service edit of the users table today anyway (email/role/status
-- changes are all admin-only, through Prisma). Revisit if a real
-- self-service need shows up later.
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin"
ON public.users FOR SELECT
USING (id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "users_update_admin_only" ON public.users;
CREATE POLICY "users_update_admin_only"
ON public.users FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_insert_admin_only" ON public.users;
CREATE POLICY "users_insert_admin_only"
ON public.users FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_delete_admin_only" ON public.users;
CREATE POLICY "users_delete_admin_only"
ON public.users FOR DELETE
USING (public.is_admin());

-- ============================================================
-- team_profiles
-- Public reads published profiles only; a member reads/writes their own
-- row (including before it's published, since they need to see/edit
-- their own draft); admin reads/writes everything.
-- ============================================================
ALTER TABLE public.team_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_profiles_select_published_or_own_or_admin" ON public.team_profiles;
CREATE POLICY "team_profiles_select_published_or_own_or_admin"
ON public.team_profiles FOR SELECT
USING ("hasBeenPublished" = true OR "userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "team_profiles_insert_own_or_admin" ON public.team_profiles;
CREATE POLICY "team_profiles_insert_own_or_admin"
ON public.team_profiles FOR INSERT
WITH CHECK ("userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "team_profiles_update_own_or_admin" ON public.team_profiles;
CREATE POLICY "team_profiles_update_own_or_admin"
ON public.team_profiles FOR UPDATE
USING ("userId" = auth.uid()::text OR public.is_admin())
WITH CHECK ("userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "team_profiles_delete_admin_only" ON public.team_profiles;
CREATE POLICY "team_profiles_delete_admin_only"
ON public.team_profiles FOR DELETE
USING (public.is_admin());

-- ============================================================
-- services / projects / community_updates
-- No draft/published distinction exists for these three in the actual
-- data model (unlike team_profiles) — every row an admin creates is
-- immediately what the public site shows. So "public reads
-- published/approved data only" is just "public reads everything here";
-- there's no unpublished state to exclude. Writes are admin-only.
--
-- The admin-only policy uses FOR ALL, which in Postgres covers SELECT
-- too — harmless (policies for the same command OR together, and the
-- public SELECT policy already allows everyone), just noting it so it
-- doesn't look like an attempt to narrow the SELECT policy above it.
-- ============================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_public" ON public.services;
CREATE POLICY "services_select_public"
ON public.services FOR SELECT
USING (true);

DROP POLICY IF EXISTS "services_write_admin_only" ON public.services;
CREATE POLICY "services_write_admin_only"
ON public.services FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_public" ON public.projects;
CREATE POLICY "projects_select_public"
ON public.projects FOR SELECT
USING (true);

DROP POLICY IF EXISTS "projects_write_admin_only" ON public.projects;
CREATE POLICY "projects_write_admin_only"
ON public.projects FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

ALTER TABLE public.community_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_updates_select_public" ON public.community_updates;
CREATE POLICY "community_updates_select_public"
ON public.community_updates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "community_updates_write_admin_only" ON public.community_updates;
CREATE POLICY "community_updates_write_admin_only"
ON public.community_updates FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- _ProjectToTeamProfile (Prisma's implicit join table for
-- Project.teamMembers / TeamProfile.projects)
-- Public read (which members worked on which project is already shown
-- publicly on /projects/[slug] and /team/[slug] — not sensitive on its
-- own); admin-only write, matching "featured work is admin-assigned
-- only, never self-attributed" (SPEC.md Section 5).
-- ============================================================
ALTER TABLE public."_ProjectToTeamProfile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_team_select_public" ON public."_ProjectToTeamProfile";
CREATE POLICY "project_team_select_public"
ON public."_ProjectToTeamProfile" FOR SELECT
USING (true);

DROP POLICY IF EXISTS "project_team_write_admin_only" ON public."_ProjectToTeamProfile";
CREATE POLICY "project_team_write_admin_only"
ON public."_ProjectToTeamProfile" FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- profile_activity
-- Owner (the team member this activity belongs to, via team_profiles)
-- can read their own history and add to it themselves — matches the
-- real flow: submitProfileAction creates a "submitted" entry when the
-- *member* submits, not an admin. Admin reads/writes everything.
-- Update/delete restricted to admin only — activity entries are meant
-- to be an immutable log, not even the owner should edit/remove one
-- after the fact.
-- ============================================================
ALTER TABLE public.profile_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_activity_select_owner_or_admin" ON public.profile_activity;
CREATE POLICY "profile_activity_select_owner_or_admin"
ON public.profile_activity FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.team_profiles tp
    WHERE tp.id = "teamProfileId" AND tp."userId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "profile_activity_insert_owner_or_admin" ON public.profile_activity;
CREATE POLICY "profile_activity_insert_owner_or_admin"
ON public.profile_activity FOR INSERT
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.team_profiles tp
    WHERE tp.id = "teamProfileId" AND tp."userId" = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "profile_activity_update_admin_only" ON public.profile_activity;
CREATE POLICY "profile_activity_update_admin_only"
ON public.profile_activity FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "profile_activity_delete_admin_only" ON public.profile_activity;
CREATE POLICY "profile_activity_delete_admin_only"
ON public.profile_activity FOR DELETE
USING (public.is_admin());

-- ============================================================
-- invites
-- Contains real tokens — no public read, full stop. Admin gets
-- explicit access (rather than relying only on "no policy = no
-- access") so an admin-side PostgREST call would also work, not only
-- the app's own Prisma path. Anyone who isn't admin (including
-- anonymous/anon-key requests) gets nothing — no SELECT policy exists
-- for them at all.
-- ============================================================
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invites_all_admin_only" ON public.invites;
CREATE POLICY "invites_all_admin_only"
ON public.invites FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- _prisma_migrations
-- Prisma's own internal migration-tracking table. No public access
-- whatsoever, not even admin — nothing in the app should ever touch
-- this table; only Prisma's own tooling does, via the bypassing
-- connection. RLS enabled with zero policies = default-deny for every
-- role that isn't exempt via BYPASSRLS.
-- ============================================================
ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;
