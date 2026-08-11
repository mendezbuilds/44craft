import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Admin's card surface — same shape and bg (`#141310`, `rgba(255,255,255,0.08)`
 * border) as the public Card component (ui/card.tsx) and dashboard's
 * status/summary cards, per the design-correction pass: admin isn't a
 * separately-toned system anymore, it's the same card language. `glow`
 * mirrors Card's hover treatment (gold-tinted border + shadow lift) for
 * panels that should read as interactive/actionable (e.g. a stat card
 * that links somewhere, or one flagging something that needs attention).
 */
export function AdminPanel({
  glow = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141310] p-5",
        glow &&
          "transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-1 hover:border-[rgba(212,175,55,0.45)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.4),0_0_20px_rgba(245,225,164,0.16)]",
        className,
      )}
      {...props}
    />
  );
}
