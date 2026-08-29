"use client";

/**
 * next/link's built-in hash-scroll only fires on an actual URL change.
 * Click "/#contact", scroll away by hand, click the exact same link
 * again — the target URL is identical to the current one, so the router
 * treats it as a no-op and never re-scrolls. Every same-page anchor link
 * on the site (`/#about`, `/#services`, `/#team`, `/#contact` — the nav,
 * the footer, every "Start a project" button) hits this the same way.
 *
 * Fix: handle the scroll ourselves whenever the target section already
 * exists in the current DOM, instead of trusting the router to notice a
 * hash "change" that, from a click's perspective, never happened.
 * Falls through to normal Link/anchor navigation (returns false, caller
 * doesn't preventDefault) when the id isn't on the current page — e.g.
 * clicking "Services" from /team, which still needs a real navigation
 * to `/` first.
 */
export function scrollToHashIfPresent(href: string): boolean {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return false;

  const id = href.slice(hashIndex + 1);
  const el = document.getElementById(id);
  if (!el) return false;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  // replaceState, not pushState — this is a re-scroll to where the URL
  // already claims to point, not a new place worth its own back-button
  // stop every time someone clicks the same nav link twice.
  window.history.replaceState(null, "", href);
  return true;
}
