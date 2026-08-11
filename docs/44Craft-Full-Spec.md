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

**Logo:** monochrome black/white wordmark ("44CRAFT") with a diamond mark above it, set against a faceted/crystalline geometric shard background. This is the seed for the whole visual language (see Section 2).

---

## 2. Visual Design System

### Core direction
**The background is dark and stays dark — near-black, no exceptions.** Everything else (text, buttons, structure) stays monochrome (white/gray). Color is NOT a background treatment, a text treatment, or a button fill. Color lives only in small discrete objects: icons, the diamond mark, floating shard fragments, hover-state glows.

### Color tokens
```
--canvas:     #0B0812   (near-black, base for every surface — no grid pattern, no texture)
--ink:        #F2EEFF   (primary text, white)
--ink-dim:    #B7B2C9   (secondary/muted text)
--violet:     #7C3AED   (accent — objects only)
--blue:       #3B82F6   (accent — objects only)
--cyan:       #22D3EE   (accent — objects only)
```
The three accents combine as a **prism gradient** (`linear-gradient(135deg, violet, blue, cyan)`) — used ONLY on:
- The diamond mark (navbar logo icon, favicon)
- The hero's faceted diamond centerpiece
- Small floating shard fragments (ambient background objects)
- Hover-state glows (box-shadow, not fill) on buttons and interactive elements
- Tiny accent details (e.g. a single dot before an eyebrow label)

**Never used for:** page backgrounds, body text, headlines, button fills, large surface areas. Buttons are dark/monochrome (see below) — a thin gradient-tinted border on the primary button is the only color a button gets.

### Type
- Display: Space Grotesk (bold, architectural headlines)
- Body: Inter
- Utility/mono: JetBrains Mono (skill tags, addresses, technical labels, eyebrow text)

### Buttons
- Primary: dark fill (`#14101C`), 1px border `rgba(124,58,237,0.45)`, white text. Hover: soft violet/cyan glow via box-shadow, border brightens — no fill change.
- Secondary/ghost: transparent background, 1px border `rgba(255,255,255,0.14)`, dimmer text. Hover: faint glow, border brightens slightly.
- Never a solid gradient-filled button.

### Signature motion language
- **Hero:** the faceted diamond assembles itself on load/scroll — facets fade and scale in with a staggered delay, like the piece is being crafted in front of you. This is the site's one big visual statement.
- **Team teaser:** clicking a skill filter chip triggers a spark-burst — current cards shatter into small gradient-colored embers/particles, new matching cards re-form from those particles. Cards also get a subtle cursor-reactive 3D tilt.
- **Ambient background:** a few slow-drifting shard fragments (small triangle/polygon shapes, prism gradient, very low opacity, ~9s drift loop) — NOT a grid pattern, NOT a dense particle field. Sparse and quiet.
- **Member profile "live" moment:** one earned exception in the dashboard — when a profile flips from pending to live, the status card plays a brief gradient glow/settle animation once, then goes calm.
- **Everywhere else stays quiet.** Admin dashboard and routine dashboard actions (editing, saving, logging in) use plain fades/slides — no gradient, no particles, no glow. Reserve the big moments for the public showcase so they don't lose impact through overuse.
- Respect `prefers-reduced-motion` everywhere — disable animations, keep end-states visible.

### What NOT to do
- No blueprint/grid background pattern (rigid repeating squares — explicitly rejected)
- No gradient text on headlines
- No gradient-filled buttons
- No large radial gradient washes across page backgrounds — if any ambient glow is used, keep it extremely subtle (a hint, not a wash)

### Background texture — confirmed
The dark canvas carries a subtle **constellation pattern**: thin monochrome lines connecting scattered nodes, plus a few faint low-opacity triangle fragments — pulled directly from the actual logo's background artwork, not invented. This is distinct from a grid (which is rigid/repeating and was rejected) — the constellation is organic, sparse, and brand-accurate. Keep it very low-opacity (lines ~7% white, nodes ~25-30% white, triangle fills ~3-4% white) so it reads as texture, never competes with foreground content.

A working HTML mockup of the navbar + hero exists and reflects all of the above, including the confirmed constellation background — use it as the literal visual reference.

---

## 3. Tech Stack

- **Framework:** Next.js (App Router)
- **Database + Auth + Storage:** Supabase (the user creates this project themselves — use env vars, don't assume credentials)
- **ORM:** Prisma
- **Transactional email:** Resend (sandbox domain `onboarding@resend.dev` for early development — can only send to the account owner's own email until a custom domain is verified; swap the "from" address later, no code changes needed)
- **Animation:** Framer Motion
- **3D:** Three.js / React Three Fiber (for the hero's faceted diamond / assembling moment)
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
2. **Hero** — eyebrow ("4 Rules — 4 Outcome" or similar, mono, small gradient dot accent), headline (plain white/gray, no gradient text), subhead pulling from the real brand voice, two CTAs ("Start a project," "See our work"). Signature moment: the faceted diamond assembles on scroll (see Section 2).
3. **About** — manifesto-style copy pulled from the real brand voice. No decorative grid — keep it plain and dark.
4. **What we offer (teaser)** — 3–4 featured service cards → "See all services" → `/services`.
5. **Why work with us** — real stats/differentiators if available; count-up on scroll only if numbers are real.
6. **Team teaser** — 4–5 curated members by default. Skill filter chips swap the visible set via the spark-burst transition (Section 2). Cursor-reactive card tilt. "Meet the full team" → `/team`.
7. **Contact** — inline success state on submit, no redirect.
8. **Footer** — logo, nav, socials, copyright.

### Services (`/services`, `/services/[slug]`)
- Index: grid of offer cards (icon, title, one-liner) → click opens detail page.
- Detail: full description, deliverables list, "who you'd work with" (team members tagged with that skill), related past projects, CTA to contact.

### Team (`/team`, `/team/[slug]`)
- Grid: ~10 people, simple responsive layout, staggered reveal animation on scroll ("assembling" in sequence). No filtering needed at this size.
- Profile: photo, name, role, socials, bio, full skills as tags, featured work (linked projects, admin-assigned), services they cover (reverse-linked). If viewing your own profile while logged in: "Edit profile" button replaces the public view.

### Projects (`/projects`, `/projects/[slug]`)
- Index: cover image, title, service tags, avatar stack of team members involved.
- Detail: banner, description, tags (→ linked service pages), "Built by" avatar row (→ linked team profiles), gallery, "Visit live site," next/prev navigation.

### Community (`/community`)
Built out fully — not just a homepage mention:
- Vision statement front and center
- Partners showcase — Chronara AI Africa & Starmark, real depth per partner (not a logo strip)
- Real, honestly-scaled stats
- Join CTA (Discord/Telegram — link TBD, see open items)
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

Independent route group and root layout — no shared nav, footer, or public-site animation. Visually calm/utility (dark canvas + same type system, but no embers/spark-bursts/gradient objects — those are reserved for the public site).

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
- Resend account — sandbox domain works for Phase 1, real domain + verification later
- Vercel account — already set up
- GitHub repo — not created yet, will be added once ready for full testing; don't assume a repo exists early on

---

## 13. Still Open (not blockers for Phase 1, but needed before their relevant phase)

- Contact form field list + where submissions land (email only, or stored in Supabase too?)
- Discord/Telegram link for the community "join" CTA
- Real content for "why work with us" stats/differentiators
- Whether notification emails need per-user preference toggles, or are mandatory
- Real projects to populate `/projects` at launch, or a "coming soon" state
- The actual "4 Rules" behind the tagline, if worth turning into real content
