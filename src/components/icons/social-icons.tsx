import type { Socials } from "@/lib/team-profile";

/**
 * Small monochrome glyphs for team-card-compact.tsx's icon row — plain
 * `currentColor` strokes/fills, no gradient (SPEC.md Section 2: gold lives
 * only on the diamond mark, shard fragments, and hover glows — not on
 * every small icon in the UI). Sized via the wrapping button, not here.
 */
export const SOCIAL_ICONS: Record<keyof Socials, (props: { className?: string }) => React.ReactElement> = {
  github: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  ),
  linkedin: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 5a2 2 0 1 1-4-.02 2 2 0 0 1 4 .02ZM7 8.48H3V21h4V8.48Zm6.32 0H9.35V21h3.94v-6.57c0-3.66 4.77-3.96 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.68-2.91V8.48Z" />
    </svg>
  ),
  x: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.6 10.6 20.4 3h-1.6l-5.9 6.6L8.2 3H3l7.1 10.1L3 21h1.6l6.2-7 5 7H21l-7.4-10.4Zm-2.2 2.5-.7-1L5 4.3h2.2l4.6 6.4.7 1 6 8.4h-2.2l-4.9-6.6Z" />
    </svg>
  ),
  website: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.8 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.8-3.8-9s1.3-6.4 3.8-9Z" />
    </svg>
  ),
};
