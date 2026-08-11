import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Consistent horizontal rhythm + max-width for every homepage section,
 * matching the hero container in docs/44craft-hero-mockup.html
 * (max-width 1180px, 56px desktop / 28px mobile side padding). Vertical
 * padding has a sane default but is meant to be overridden per section.
 */
export function Section({
  as: Tag = "section",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: ElementType }) {
  return (
    <Tag
      className={cn(
        "mx-auto max-w-[1180px] px-7 py-20 md:px-14",
        className,
      )}
      {...props}
    />
  );
}
