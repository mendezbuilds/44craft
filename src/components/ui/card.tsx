import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Base surface for team/project/service grids (Phase 3+). Dark, monochrome,
 * a hairline border — no gradient fill. `hover` adds a gold-tinted
 * border-brighten + a dual shadow (dark drop-shadow to sell the lift, gold
 * glow for brand accent) plus a -4px lift, on a fast 160ms transition —
 * tactile rather than a slow color fade.
 */
export function Card({
  hover = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141310] p-6",
        hover &&
          "transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-1 hover:border-[rgba(212,175,55,0.45)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.4),0_0_20px_rgba(245,225,164,0.16)]",
        className,
      )}
      {...props}
    />
  );
}
