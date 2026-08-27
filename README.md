# 44Craft

Phase 1 (Foundation) is implemented: project scaffold, Supabase auth, the
full Prisma schema, invite-based onboarding, and role-gated `/admin` and
`/dashboard` route groups. No visual design yet — see `SPEC.md` for the
full project spec and phased build plan.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + DB) ·
Prisma (with the `@prisma/adapter-pg` driver adapter, required as of
Prisma ORM 7) · Resend

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API**: copy the Project URL, `anon` public key, and
   `service_role` secret key.
3. **Project Settings → Database → Connection pooling**: copy two connection
   strings, both from the **pooler** (not the "Direct connection" tab — that
   host is IPv6-only and unreachable from a lot of networks):
   - **Session** mode (port `5432`) → `DIRECT_URL`, used by Prisma Migrate
   - **Transaction** mode (port `6543`) → `DATABASE_URL`, used by the app

   Both share the same `postgres.<project-ref>` username and hostname
   (something like `aws-0-<region>.pooler.supabase.com`) — only the port
   differs. If `6543` gets refused on your network but `5432` works, it's
   fine to point `DATABASE_URL` at the session/5432 URL too; you lose
   connection-pooling benefits under load but local dev doesn't need them.
4. Email/password auth is on by default — nothing to configure there.
   There is no public sign-up route in this app; all accounts are created
   via the invite flow or the bootstrap script below.

## 2. Create a Resend account

Sandbox mode (`onboarding@resend.dev`) works for local development but can
only deliver to the email address on your Resend account. Get an API key
from [resend.com](https://resend.com).

> The live `44craft.com` deployment already has its own domain verified in
> Resend (`EMAIL_FROM` in `src/lib/resend.ts` sends as `hello@44craft.com`
> to any recipient) — this sandbox caveat only applies if you're setting up
> a separate Resend account of your own for local development.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local`:

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret, server-only) |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection pooling (Transaction mode, port 6543) |
| `DIRECT_URL` | Supabase → Project Settings → Database → Connection pooling (Session mode, port 5432) |
| `RESEND_API_KEY` | Resend → API Keys |
| `CONTACT_EMAIL_TO` | Inbox that receives `/contact` form submissions — optional, that form just reports "not configured yet" without it |
| `ADMIN_NOTIFICATION_EMAIL` | Inbox that receives "a profile edit needs review" pings — optional, deliberately separate from `CONTACT_EMAIL_TO` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Whatever you want the first admin's login to be — only read by the seed script below, not at runtime |

## 4. Install, generate, migrate

```bash
npm install
npm run db:migrate    # creates tables from prisma/schema.prisma
```

`db:migrate` runs `prisma generate` automatically as part of `migrate dev`.

## 5. Bootstrap the first admin

There's no public sign-up page, so the first admin account is created
directly, not through the app:

```bash
npm run seed:admin
```

Reads `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env.local`. Refuses
to run if an admin already exists.

Alternatively, if you'd rather create the account by hand in the Supabase
dashboard (**Authentication → Users → Add user**, with "Auto Confirm User"
checked) so the password never has to touch `.env.local` at all, link it
as admin afterward instead:

```bash
LINK_ADMIN_EMAIL=you@example.com npm run link:admin
```

This stamps `app_metadata.role=admin` on that Supabase user and creates
the matching `User` row — same effect as `seed:admin`, different starting
point. Also refuses to run if an admin already exists.

## 6. Create the profile-photo storage bucket

```bash
npm run setup:storage
```

Creates a public Supabase Storage bucket (`team-photos`) if it doesn't
already exist — idempotent, safe to re-run. Photo uploads go through a
server action using the service-role client (`src/lib/team-profile-actions.ts`),
not a browser-direct upload, so no Storage RLS policies need configuring.

## 7. Run the app

```bash
npm run dev
```

- Sign in at `/signin` with the seeded admin credentials.
- From `/admin/invites`, send an invite to another email address. If you're
  running your own Resend account still in sandbox mode, this only
  actually delivers if that address is the one on your account — check the
  Resend dashboard logs either way to grab the link if delivery is skipped.
- Open the invite link (`/accept-invite/[token]`), set a password — the
  account is created and active immediately, landing in `/dashboard`,
  which redirects straight into the guided profile editor
  (`/dashboard/profile`) since there's no profile yet.
- Complete the 5-step editor (photo, name/role, bio, skills, featured
  work) and submit — the profile is now `pending`.
- Sign back in as the admin, go to `/admin/reviews` (bare-bones on
  purpose — the real diff-view review UI is Phase 6), and approve or
  reject. Approving publishes it to the real `/team` grid and
  `/team/[slug]`; rejecting sends it back to `draft` with an optional
  note the member sees on their dashboard status card.
- Visiting `/admin/*` as a non-admin (or signed out) redirects away;
  visiting `/dashboard` signed out redirects to `/signin`.

## Notes on the current state

- **No `TeamProfile` row is created at invite-accept time.** It's created
  by the guided editor's first submit (`submitProfileAction`,
  `src/lib/team-profile-actions.ts`) — until then `/dashboard` redirects
  there instead of showing an empty dashboard.
- **`publishedVersion`/`pendingVersion` vs. the top-level columns**:
  `name`/`roleTitle`/`photo`/`bio`/`skills` are the member's current
  working copy (what the editor pre-fills from, updated on every submit).
  `pendingVersion` is a snapshot taken at submit time; `publishedVersion`
  is a snapshot taken at *approval* time and is what the public `/team`
  pages actually render — so an unapproved edit sitting in
  `pendingVersion` never leaks onto the public site, even though the
  top-level columns already reflect it.
- **Auth check is layered, per Next.js's own guidance for the App
  Router's `proxy.ts`**: `src/proxy.ts` does a fast, cookie-based redirect
  for UX; `src/lib/auth.ts` (`getCurrentUser`, `requireAdmin`) does the
  authoritative check inside every admin/dashboard layout and server
  action, since proxy matchers can silently stop covering a route after a
  refactor.
- Role is stored in two places on purpose: Supabase Auth
  `app_metadata.role` (used by `proxy.ts`, only settable via the
  service-role client) and the Prisma `User.role` column (used for
  relational queries in the app). Both are written together whenever an
  account is created (seed script, invite acceptance).
- **`scripts/*.ts` load env vars via `tsx --env-file=.env.local`, not a
  `dotenv` import inside the script.** `import` statements are hoisted
  above regular code, so a `dotenv.config()` call placed before
  `import { prisma } from "../src/lib/prisma"` still loses the race —
  `lib/prisma.ts` reads `process.env.DATABASE_URL` at module-evaluation
  time, which happens during import hoisting, before `config()` would
  have run. If you add a new script that touches the database, follow the
  existing two (`tsx --env-file=.env.local scripts/your-script.ts`) rather
  than reaching for `dotenv` again.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate the Prisma client after a schema change |
| `npm run db:migrate` | Create/apply a migration |
| `npm run db:studio` | Prisma Studio, a GUI for the database |
| `npm run seed:admin` | One-time bootstrap admin creation |
| `LINK_ADMIN_EMAIL=... npm run link:admin` | Promote a manually-created Supabase user to admin instead |
