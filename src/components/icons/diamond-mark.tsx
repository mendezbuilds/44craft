import { cn } from "@/lib/cn";

/**
 * The one recurring gradient object in the design system: navbar logo icon,
 * favicon, and the small accent dot before eyebrow labels are all this same
 * mark at different sizes. Per SPEC.md Section 2 (gold correction), the gold
 * gradient never appears on anything else (backgrounds, text, button fills).
 */
export function DiamondMark({
  size = 14,
  glow = true,
  className,
}: {
  size?: number;
  glow?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 rotate-45", className)}
      style={{
        width: size,
        height: size,
        backgroundImage: "var(--gradient-gold)",
        boxShadow: glow ? "0 0 16px rgba(138,109,29,0.5)" : undefined,
      }}
    />
  );
}
