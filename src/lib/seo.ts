import type { Metadata } from "next";

/**
 * Shared fallback OG image, referenced from the root layout's site-wide
 * default *and* every dynamic route's own generateMetadata(). Needed in
 * both places because Next.js doesn't deep-merge a route's `openGraph`
 * object with its parent's — a child that defines `openGraph` at all
 * replaces the whole object, so a page with no entity-specific image
 * (no project cover, no profile photo) has to name this fallback itself
 * rather than relying on inheriting it from the root layout.
 */
export const DEFAULT_OG_IMAGE: NonNullable<NonNullable<Metadata["openGraph"]>["images"]> = [
  { url: "/brand/og-default.png", width: 1200, height: 630, alt: "44Craft" },
];
