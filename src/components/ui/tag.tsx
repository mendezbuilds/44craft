import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Mono chip for skills, addresses, and other technical labels
 * (SPEC.md Section 2 — JetBrains Mono's job).
 */
export function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[rgba(255,255,255,0.14)] px-3 py-1 font-mono text-xs text-ink-dim",
        className,
      )}
      {...props}
    />
  );
}
