"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { scrollToHashIfPresent } from "@/lib/hash-scroll";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-[6px] px-5 py-[10px] font-body text-[13.5px] " +
  "transition-[box-shadow,border-color,transform] duration-200 ease-out active:duration-100 " +
  "active:scale-[0.97] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-[3px] " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary:
    "border border-ink bg-ink font-semibold text-[#0A0A08] " +
    "hover:shadow-[0_0_20px_rgba(245,225,164,0.3)]",
  // bg + backdrop-blur (not fully transparent) so this stays legible over
  // busy backgrounds (constellation lines, the bleeding hero logo) instead
  // of being fully see-through.
  ghost:
    "border border-[rgba(255,255,255,0.14)] bg-black/25 backdrop-blur-sm font-medium text-ink-dim " +
    "hover:border-[rgba(255,255,255,0.3)] hover:shadow-[0_0_14px_rgba(255,255,255,0.08)]",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Primary/ghost per the gold correction (docs/44craft-hero-mockup.html v2).
 * Primary flipped from the original dark-fill spec to a solid `--ink`
 * (near-white) fill with dark text — still never a gradient fill, but no
 * longer dark either; this supersedes SPEC.md Section 2's original "primary
 * is always dark" rule. Ghost keeps a border-only *look* but isn't actually
 * `bg-transparent` — a translucent dark fill + backdrop-blur keeps it
 * legible over busy backgrounds (constellation lines, the bleeding hero
 * logo) instead of being fully see-through.
 *
 * `active:scale-[0.97]` (site-wide feedback-polish pass) gives every
 * button a quick tactile press — hover states alone read as flat images.
 * Faster transition on the way down (`active:duration-100`) than back up,
 * so the press itself feels snappy while the release doesn't overshoot.
 */
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if ("href" in props && props.href) {
    const { href, onClick, ...rest } = props;
    return (
      <Link
        href={href}
        className={classes}
        onClick={(e) => {
          // See hash-scroll.ts — next/link's own hash handling only
          // fires on an actual URL change, so a same-page anchor link
          // clicked twice (with a manual scroll away in between) does
          // nothing the second time without this.
          if (scrollToHashIfPresent(href)) e.preventDefault();
          onClick?.(e);
        }}
        {...rest}
      />
    );
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}
