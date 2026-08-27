# 44Craft — Full Project Spec

This is the complete reference for building 44Craft. Read this in full before writing any code.

## 1. What 44Craft is

44Craft is two things at once:
- A **craft-driven agency** delivering real client work (web3, marketing, social media management, and more)
- A **growing community** for self-made builders — "craftsmen figuring it out with no handouts"

The site must carry both identities without either diluting the other.

**Vision:** become a large African tech community, welcoming people from web2 into web3 — a place to explore, grind, and win together.

**Community context:** early-stage, real but small (~455 X followers, based in Africa). Reflect this honestly — no inflated numbers, no fake scale.

**Official partners:** Chronara AI Africa, Starmark. Both are long-term, official partnerships — framed as commitment, not one-off collaborations.

**Brand voice:** direct, confident, unpolished-on-purpose. "Infrastructure, not narratives." "Aligned for the long term, not a short-term collaboration." Copy reads like plain statements — no corporate padding.

**Tagline:** "4 Rules — 4 Outcome" (the actual 4 rules aren't defined yet — treat as a brand mark, not literal content, unless/until defined).

**Logo:** gold wordmark ("44CRAFT", gold correction — was originally monochrome black/white) with a small diamond mark above it, set against a faceted/crystalline geometric shard background. This is the seed for the whole visual language (see Section 2). Real source files: `docs/logo.png`, `docs/1500x500 cover.png`.

---

## 2. Visual Design System

> **Gold correction (supersedes the palette below where noted):** the accent
> system moved from a violet/blue/cyan prism to a single-hue gold gradient,
> and the primary button flipped from dark-fill to a solid `--ink` fill with
> dark text. Canvas moved to a neutral near-black (was purple-tinted).
> Reference: `docs/44craft-hero-mockup.html` (v2) is the literal source of
> truth for exact values — this section has been updated to match it.

### Core direction
**The background is dark and stays dark — near-black, no exceptions.** Everything else (text, structure) stays monochrome (white/gray) except the primary button, which is a solid light fill (see Buttons below) — that's the one deliberate exception to "color lives only in small objects," and it doesn't use the gold gradient, just solid `--ink`. Gold itself is NOT a background treatment, a text treatment, or a button fill. It lives only in small discrete objects: icons, the diamond/gem mark, floating shard fragments, hover-state glows.

### Color tokens
```
--canvas:      #0A0A08   (neutral near-black, base for every surface — no grid pattern, no texture)
--ink:         #F2EEFF   (primary text, white; also the primary button's fill)
--ink-dim:     #B7B2C9   (secondary/muted text)
--gold-deep:   #8A6D1D   (accent — objects only)
--gold:        #D4AF37   (accent — objects only)
--gold-light:  #F5E1A4   (accent — objects only)
```
The three shades combine as a **gold gradient** (`linear-gradient(135deg, gold-deep, gold, gold-light)`) — used ONLY on:
- The diamond/gem mark (navbar logo icon, favicon)
- The hero's real photo logo mark (`FloatingMark`) — see the Signature motion language note below; the abstract facet-diamond version was tried and retired
- Small floating shard fragments (ambient background objects)
- Hover-state glows (box-shadow, not fill) on buttons and interactive elements
- Tiny accent details (e.g. a single dot before an eyebrow label)

**Never used for:** page backgrounds, body text, headlines, large surface areas, button fills (the primary button's `--ink` fill is solid, not gradient). A thin gold-tinted glow on hover is the only color most buttons get.

### Type
- Display: Space Grotesk (bold, architectural headlines)
- Body: Inter
- Utility/mono: JetBrains Mono (skill tags, addresses, technical labels, eyebrow text)

### Buttons
- Primary (gold correction — was dark-fill): solid `--ink` fill, `--ink` border, dark (`#0A0A08`) text, semibold. Hover: soft gold-light glow via box-shadow — no fill or border-color change.
- Secondary/ghost: unchanged — transparent background, 1px border `rgba(255,255,255,0.14)`, dimmer text. Hover: faint white glow, border brightens slightly.
- Still never a *gradient*-filled button — primary's fill is solid, not the gold gradient.

### Signature motion language
- **Hero:** the brand mark has a continuous quiet float (~7s ease-in-out, small amplitude) plus a one-time entrance (rotate/scale/fade in on load) on a separate layer so the two motions don't fight — this replaced the original per-facet "assembling" stagger once the centerpiece became a real photo-sourced image rather than individually-animatable SVG facets (see `src/components/motion/floating-mark.tsx`, `src/components/hero.tsx`). The real interactive 3D assembling diamond is still a later-phase goal. **Tried and reverted once already:** an abstract 8-facet SVG gem (ported from the original mockup) that assembled first and then cross-faded into this photo — even as a ~1.5s transient before settling on the real mark, it read as "the invented diamond is back," which is exactly what the gold correction below said not to do. Don't reintroduce facet assembly without either (a) tracing facets to the real mark's own silhouette, not a generic diamond outline, or (b) checking with the client first — this has been tried once and explicitly rejected.
- **Team teaser:** clicking a skill filter chip triggers a spark-burst — current cards shatter into small gradient-colored embers/particles, new matching cards re-form from those particles. Cards also get a subtle cursor-reactive 3D tilt. **Mobile only (below ~601px), on request:** the multi-column grid is replaced by a one-card-at-a-time swipeable carousel (`src/components/team-carousel.tsx`) — a cramped 2-column grid on a phone wasn't the goal, one full-width card you swipe/slide through is. Its slide is a distinct compact card (`team-card-compact.tsx`), not the grid's `TeamCard` reused: ~70/30 photo-to-info split (photo gets its own fixed aspect ratio, not a flex-1 fighting the text below it — see that file's sizing note for why, hard-won this session), info is just name + social-icon row, not role/skills — a swipeable single slide is a glance/browse moment, tap through to the profile for the rest. Filtering still applies (same filtered set feeds the carousel), replaying a plain fade instead of trying to adapt the grid's multi-card shatter/reform to one visible slide. Desktop/tablet (≥601px) is unchanged — same grid, same `TeamCard`, same spark-burst. The full `/team` roster page also stays the unchanged grid at every width; this carousel treatment is teaser-only, on request.
- **Ambient background:** a few slow-drifting shard fragments (small triangle/polygon shapes, gold gradient, very low opacity, ~8s drift loop, independently staggered so they don't move in sync) — NOT a grid pattern, NOT a dense particle field. Sparse and quiet.
- **Member profile "live" moment:** one earned exception in the dashboard — when a profile flips from pending to live, the status card plays a brief gradient glow/settle animation once, then goes calm.
- **Admin dashboard AND sign-in get full brand AND motion parity with the public site** (second design correction — per client request, supersedes the "smaller echoes only" version of this bullet, see Section 8): there is no separate "admin register" anymore. The entire authenticated experience (sign-in through every admin page) uses the same design system, gold accents, icons, card treatment, and signature motion language as the public homepage — including the larger moments (the mark's fade/rotate/scale entrance, the real spark-burst), not just small echoes like the approve-button particle burst.
  - **Resolved:** the biggest moments replay only on genuinely first-time/entry points (sign-in, first admin page of a session — `useSyncExternalStore` + localStorage, see `src/components/motion/entry-gem.tsx`), not on every repeated action. Routine daily actions (approving the 50th profile that month) keep the small contained echo (`GoldBurst` "small" size).
  - The hero's hero-scale moment is the mark's own fade/rotate/scale entrance (not a facet assembly — see the note above), and the team-teaser's skill-filter spark-burst (shatter/reform), built for real during this pass after being deferred in Phase 5. "Parity" means sign-in/admin get the same components (`FloatingMark` via `EntryGem`), not a separate reimplementation.
- Respect `prefers-reduced-motion` everywhere — disable animations, keep end-states visible.

### What NOT to do
- No blueprint/grid background pattern (rigid repeating squares — explicitly rejected)
- No gradient text on headlines
- No gradient-filled buttons
- No large radial gradient washes across page backgrounds — if any ambient glow is used, keep it extremely subtle (a hint, not a wash)

### Background texture — confirmed
The dark canvas carries a subtle **constellation pattern**: thin monochrome lines connecting scattered nodes — pulled directly from the actual logo's background artwork, not invented. This is distinct from a grid (which is rigid/repeating and was rejected) — the constellation is organic, sparse, and brand-accurate. Keep it very low-opacity (lines ~6% white, nodes ~22% white) so it reads as texture, never competes with foreground content. The gold-correction v2 mockup dropped the separate low-opacity triangle-fragment layer that v1 had — lines + nodes only now.

### Real brand assets — gold correction
The hero centerpiece and navbar icon are no longer an invented abstract diamond — they're background-removed crops of the actual logo artwork (`docs/logo.png` for the hero mark, `docs/1500x500 cover.png` for the small navbar diamond), stored at `public/brand/logo-mark.png` and `public/brand/logo-icon.png`. Both source files are flattened photos with the dark/constellation background baked in and no alpha channel, so the transparent versions were produced by a luminance/warmth-based matte (Python/Pillow), not manual tracing. If either source asset is replaced, re-run the extraction rather than hand-editing the PNGs.

A working HTML mockup of the navbar + hero exists (`docs/44craft-hero-mockup.html`) and reflects all of the above except the real brand-mark swap (it still shows the abstract SVG gem/diamond as a stand-in) — use it as the literal visual reference for everything else: layout, tokens, motion, spacing.

---

## 3. Tech Stack

- **Framework:** Next.js (App Router)
- **Database + Auth + Storage:** Supabase (the user creates this project themselves — use env vars, don't assume credentials)
- **ORM:** Prisma
- **Transactional email:** Resend — `44craft.com` is now verified; `EMAIL_FROM` (`src/lib/resend.ts`) sends as `hello@44craft.com` to any recipient. (Started on the sandbox `onboarding@resend.dev` domain, restricted to the account owner's own inbox — exactly the one-line swap this was always meant to be, no other code changes needed.)
- **Animation:** Framer Motion
- **3D:** Three.js / React Three Fiber (not currently used — the abstract facet-diamond concept that would have needed this was tried and retired in favor of the real photo logo mark; keep in the stack in case a future genuine 3D need comes up, don't use it to reintroduce the retired gem)
- **Hosting:** Vercel (already set up)
- **Version control:** GitHub (repo created later, once ready for full testing — don't assume it exists yet)

---

## 4. Sitemap

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, about, services teaser, why-us, team teaser, contact, footer |
| `/services` | Full services index |
| `/services/[slug]` | Individual service detail |
| `/team` | Full team grid (~10 people, no filtering needed at this size) |
| `/team/[slug]` | Individual team profile (public view) |
| `/projects` | Company project portfolio |
| `/projects/[slug]` | Individual project detail |
| `/community` | Vision, partners, join CTA, updates feed — built out fully, not just a mention |
| `/contact` | Contact form |
| `/signin` | Public sign-in — **no public sign-up page exists anywhere** |
| `/dashboard` | Member dashboard (authenticated team member) |
| `/admin/*` | Admin dashboard — own route group, own root layout, no shared nav/footer/animation with the public site |

---

## 5. Data Models

```ts
// users (Supabase Auth + profile row)
{
  id: string
  email: string
  role: 'admin' | 'team'
  status: 'active'   // accounts are active immediately on signup via invite — no separate account-approval state
}

// team_profiles
{
  userId: string
  slug: string
  name: string
  roleTitle: string
  photo: string
  bio: string
  skills: string[]
  socials?: { github?, linkedin?, x?, website? }
  featuredWork?: string[]       // project slugs — ADMIN-ASSIGNED ONLY, never self-attributed
  publishedVersion: {...}       // what the public sees
  pendingVersion?: {...}        // draft awaiting approval, null if nothing pending
  status: 'draft' | 'pending' | 'published'
}

// services
{
  slug: string
  title: string
  shortDescription: string
  icon: string
  fullDescription: string
  deliverables: string[]
  relatedTeamMembers?: string[]   // derived from team members whose skills match
  relatedProjects?: string[]
}

// projects
{
  slug: string
  title: string
  description: string
  coverImage: string
  tags: string[]                  // service types involved
  teamMembers: string[]           // who worked on it
  liveUrl?: string
}

// community_updates
{
  id: string
  title: string
  body: string
  date: string
  image?: string
}

// invites
{
  token: string
  email: string
  expiresAt: string
  usedAt?: string
}
```

---

## 6. Page-by-page spec

### Homepage (`/`)
1. **Navbar** — transparent over hero, solidifies (dark bg + hairline border) on scroll. Logo (diamond mark, gradient) + wordmark left, links center/right, "Start a project" CTA. Mobile: full-screen slide-in menu.
2. **Hero** — eyebrow ("4 Rules — 4 Outcome" or similar, mono, small gradient dot accent), headline (plain white/gray, no gradient text), subhead pulling from the real brand voice, two CTAs ("Start a project," "See our work"). Signature moment: the real photo logo mark (`FloatingMark`) fades/rotates/scales in (see Section 2 — the abstract assembling-diamond version is retired).
3. **About** — manifesto-style copy pulled from the real brand voice. No decorative grid — keep it plain and dark.
4. **What we offer (teaser)** — 3–4 featured service cards → "See all services" → `/services`.
5. **Why work with us** — real stats/differentiators if available; count-up on scroll only if numbers are real.
6. **Team teaser** — 4–5 curated members by default. Skill filter chips swap the visible set via the spark-burst transition (Section 2). Cursor-reactive card tilt. Below ~601px: swipeable single-card carousel instead of the grid, compact card (photo + name/socials only) — see Section 2. "Meet the full team" → `/team`.
7. **Contact** — inline success state on submit, no redirect.
8. **Footer** — logo, nav, socials, copyright.

### Services (`/services`, `/services/[slug]`) — built, Phase 7
- Index: grid of offer cards (icon, title, one-liner) → click opens detail page.
- Detail: full description, deliverables list, "who you'd work with" (team members tagged with that skill), related past projects, CTA to contact.

**Resolved (follow-up after Phase 7):** both pages now read from the real `Service` table via `src/lib/services.ts` — `scripts/migrate-services-to-db.ts` (rerunnable, upserts by slug) carried the static file's content over first, so nothing was lost, then the static file was deleted. The keyword map used for the skill/service matching both directions need stayed in code (`SERVICE_SKILL_KEYWORDS` in `lib/services.ts`) rather than becoming a DB field — it's matching logic, not admin-editable content. `/services/[slug]` no longer prebakes via `generateStaticParams`; it renders per-request like `/team/[slug]` and `/projects/[slug]` do, and the admin service actions call `revalidatePath` on the public routes, so an edit through `/admin/services` shows up immediately — verified end-to-end (edit through a real authenticated session, confirmed on the public page, reverted), not just assumed from the code.

### Team (`/team`, `/team/[slug]`)
- Grid: ~10 people, simple responsive layout, staggered reveal animation on scroll ("assembling" in sequence). No filtering needed at this size.
- Profile: photo, name, role, socials, bio, full skills as tags, featured work (linked projects, admin-assigned), services they cover (reverse-linked). If viewing your own profile while logged in: "Edit profile" button replaces the public view.

### Projects (`/projects`, `/projects/[slug]`) — built, Phase 7
- Index: cover image, title, service tags, avatar stack of team members involved.
- Detail: banner, description, tags (→ linked service pages), "Built by" avatar row (→ linked team profiles), gallery, "Visit live site," next/prev navigation.

**Resolved (follow-up after Phase 7):** `Project.gallery` (`String[]`, migration `20260812092821_add_project_gallery`) — same "array of pasted URLs" pattern as `tags`, editable via a one-URL-per-line textarea in the admin form. The detail page only renders the section when `gallery.length > 0`; a project without one just doesn't show it, no empty placeholder grid.

**Decided:** `next.config.ts`'s image allowlist stays restricted to the Supabase Storage host — not widened, on request. The workflow for a gallery/cover/community-update image is upload-to-Supabase-first, paste-the-resulting-URL-second, not paste-any-URL. Enforced at the form level, not just documented: `coverImage`/`gallery`/`image` in `src/lib/validation.ts` now reject a non-Supabase-hostname URL with a clear message before it ever saves, rather than saving silently and only failing later as a runtime crash on the public page. Admin form fields (`project-form.tsx`, `community-form.tsx`) hint at the expected URL shape.

**Resolved (follow-up):** two more public buckets (`project-images` — covers and gallery, under separate path prefixes; `community-images`), created by the same idempotent `scripts/setup-storage.ts` that already created `team-photos`. Real upload buttons in `/admin/projects` (cover, plus multi-file for gallery) and `/admin/community` (image), same interaction pattern as the profile photo uploader (`src/lib/storage.ts`'s `uploadImage()` is the shared upload/validate mechanics; each call site is still its own thin `requireAdmin()`-checked server action). The manual paste-a-URL fields stay visible and editable alongside the upload buttons — upload is the new normal path, not a replacement for the fallback. Verified for real: uploaded an actual file through all three points in a live admin session, confirmed each produced a real Supabase Storage URL, and confirmed the images render on the corresponding public page — then cleaned up the test DB rows and the resulting Storage objects (deleting the DB row alone doesn't delete the underlying file).

### Community (`/community`) — built, Phase 7
Built out fully — not just a homepage mention:
- Vision statement front and center — reuses the homepage About section's actual copy verbatim, not new marketing text
- Partners showcase — Chronara AI Africa & Starmark, framed with the real "official, long-term partnership" language (SPEC.md Section 1); no invented specifics about what either partner actually does — that content doesn't exist yet, and guessing at it would be exactly the fabricated-content problem this project has avoided everywhere else
- Real, honestly-scaled stats — the X follower count (Section 1) plus a live-queried published-team-member count; no invented numbers
- Join CTA (Discord/Telegram — link TBD, see open items) — rendered as a visibly-disabled "coming soon" state, not a live-looking button pointed at a dead link
- Updates/highlights feed — reuses the same CRUD pattern as projects/services

**Explicitly deferred:** a public community member directory (separate from the team roster). Different system entirely — open signup, lighter profile schema, moderation. Not worth building until the community has grown enough to need it. Keep the `users` schema loose enough to add a `community_member` role later without a rebuild, but do not build the directory UI now.

### Contact (`/contact`)
Field list and destination (email only vs. also stored in Supabase) — still open, see Section 10.

---

## 7. Auth, Onboarding & Access Model

**Three roles:** public (browse + sign in only, no public sign-up anywhere), team member (logs in, edits own profile), admin (manages everything, isolated `/admin` route group).

**Bootstrap:** the first admin account is created directly in Supabase (not through the app). That admin logs in and sends the first invites through the app from there. Every subsequent account traces back to an invite.

**Invite → live flow:**
1. Admin sends invite via Resend — unique tokenized link, expires after a set window
2. Recipient clicks it, sets a password — **account is active immediately** (the invite itself was the approval gate; there is no separate "pending account" state)
3. Guided multi-step profile setup — photo, name/role, bio, skills, featured work
4. Submits for review — the profile **content** goes into a pending state (this is the only approval gate in the whole system)
5. Admin approves → profile publishes → member notified → team member signs in anytime at `/signin`

**Do not build:** any account-level approval queue separate from the profile-content review queue. There is only one review gate, and it's on content, not on the account itself.

---

## 8. Admin Dashboard (`/admin/*`)

> **Design correction, round 2 (supersedes round 1 below, and the
> "visually calm/utility" text under it):** per client request, there is
> no separate "admin register" anymore. Sign-in and every admin page now
> get full brand AND motion parity with the public site — not just gold
> accents/icons/cards (round 1, already shipped as of this correction),
> but the signature motion language too, including the big moments (the
> mark's fade/rotate/scale entrance, the real spark-burst), not only
> small echoes. Resolved: big moments replay on first-load/entry only
> (sign-in, first admin page of a session), not on every repeated
> action — see Section 2's motion bullet. An earlier attempt at this used
> a per-facet abstract diamond assembly before settling on the real mark;
> that was reverted (also Section 2) — don't reintroduce it without
> checking first, it's been tried and explicitly rejected once already.
>
> Round 1 (already shipped): admin carries the same visual system as the
> public site — dark canvas, gold accents, the diamond mark, icons, hover
> glow, card presence. Full hero-scale moments stayed public-only under
> round 1; that boundary is what round 2 removes.

Independent route group and root layout — no shared nav or footer with the public site (own root layout still applies under the correction above — just not a separately-toned visual or motion system anymore).

- **Overview** — stats, recent activity
- **Invites** — send/revoke, status tracking
- **Profile reviews** — pending queue, side-by-side diff view (published vs. pending), approve/reject with an optional note
- **Team** — full roster, force-edit, deactivate
- **Projects & Services** — CRUD
- **Community updates** — CRUD for the highlights feed

---

## 9. Member Dashboard (`/dashboard`)

Carries the site's brand feel (dark canvas, same type system, restrained gradient touches) — not purely utilitarian, but the big showcase moments (spark-burst, hero assembly, cursor tilt) stay exclusive to the public site.

- **Status card** — live / pending review / changes requested (shows admin's note if applicable). One earned animation: a brief gradient glow plays once, the first time a profile flips from pending to live.
- **Profile summary + "Edit profile"** — opens the same guided multi-step editor from onboarding, pre-filled
- **Featured work** — read-only, admin-assigned only, no self-attribution
- **Activity log** — submitted / approved / changes-requested history
- **Account settings** — password, recovery email

---

## 10. Email Notifications (via Resend)

| Trigger | Subject |
|---|---|
| Invite sent | "You've been invited to join 44Craft" |
| Profile approved / live | "Your profile is live" |
| Changes requested | "A few tweaks needed on your profile" |
| Featured in a project | "You've been added to [Project Name]" |

Same branded template shell for all four (logo, dark canvas, one clear CTA button, short human subject lines — no "Notification: ..." style subjects).

---

## 11. Phased Build Plan

1. **Foundation** — Next.js scaffold, Supabase schema, auth + roles, invite flow, bootstrap-admin process
2. **Design system** — tokens (per Section 2), core components, dark/monochrome base with gradient reserved for objects only
3. **Public marketing pages** — navbar, hero shell, about, services teaser, why-us, contact, footer
4. **Signature hero moment** — the 3D/motion centerpiece, built and tuned in isolation (highest-risk, highest-payoff)
5. **Team system** — public grid + profiles, member login, self-service profile editor, spark-burst teaser interaction
6. **Admin dashboard** — invites, profile review queue, team/project/service/community CRUD
7. **Projects, services & community pages** — full index + detail pages, cross-linked to team and services
8. **Notifications** — Resend templates for all four trigger events
9. **Polish & launch** — responsive pass, reduced-motion support, 3D performance check, content fill-in, deploy

---

## 12. Environment / Setup Prerequisites

- Supabase project (user is creating this) — need project URL + API keys as env vars
- ~~Resend account — sandbox domain works for Phase 1, real domain + verification later~~ — **resolved**: `44craft.com` verified, see Section 3's Transactional email note
- Vercel account — already set up
- GitHub repo — not created yet, will be added once ready for full testing; don't assume a repo exists early on

---

## 13. Still Open (not blockers for Phase 1, but needed before their relevant phase)

- Contact form field list + where submissions land (email only, or stored in Supabase too?)
- Discord/Telegram link for the community "join" CTA
- Real content for "why work with us" stats/differentiators
- Whether notification emails need per-user preference toggles, or are mandatory
- Real projects to populate `/projects` at launch, or a "coming soon" state — **resolved as of Phase 7**: "coming soon" state built (same pattern as `/team`'s empty state), swaps to real content automatically the moment projects exist
- The actual "4 Rules" behind the tagline, if worth turning into real content
- ~~Reconcile the `Service` Prisma table with the static services file~~ — **resolved**, see Section 6's Services note
- ~~Add a gallery/images field to the `Project` model~~ — **resolved**, see Section 6's Projects note
- ~~Widen `next.config.ts`'s image host allowlist~~ — **decided against**, see Section 6's Projects note
- ~~Real Storage bucket + upload UI for project/community images~~ — **resolved**, see Section 6's Projects note
- Real per-partner copy for Chronara AI Africa and Starmark on `/community` — currently just the generic "official, long-term partnership" framing, no specifics about what either partner actually does
