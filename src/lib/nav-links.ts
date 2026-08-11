// Shared between Navbar and Footer so the two never drift apart.
//
// About/Services/Team scroll to homepage sections — the homepage has
// teasers for all three. Work/Community point straight at their real pages
// instead, because the homepage has no projects or community section to
// scroll to (SPEC.md's homepage layout never included either, and both
// pages are explicitly "not landing page content" — see the Phase 3
// consolidation brief). Each teaser section also carries its own "see
// all"/"meet the team" link out to the real /services and /team pages.
export const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Team", href: "/#team" },
  { label: "Work", href: "/projects" },
  { label: "Community", href: "/community" },
];
