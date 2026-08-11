import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-[10px] font-body text-[13.5px] " +
  "transition-[box-shadow,border-color,transform] duration-200 ease-out active:duration-100 " +
  "active:scale-[0.97] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-[3px] " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

// Mirrors src/components/ui/button.tsx exactly (design-correction pass —
// admin now carries the same visual system as the public site, SPEC.md
// Section 8) — primary/ghost are the identical classes, not just a similar
// look. `danger` is admin-only (reject/deactivate/delete have no public
// equivalent) but follows the same shape: border-only, glow on hover, no
// fill.
const variants: Record<Variant, string> = {
  primary: "border border-ink bg-ink font-semibold text-[#0A0A08] hover:shadow-[0_0_20px_rgba(245,225,164,0.3)]",
  ghost:
    "border border-[rgba(255,255,255,0.14)] bg-black/25 backdrop-blur-sm font-medium text-ink-dim " +
    "hover:border-[rgba(255,255,255,0.3)] hover:shadow-[0_0_14px_rgba(255,255,255,0.08)]",
  danger:
    "border border-red-500/30 bg-black/25 backdrop-blur-sm font-medium text-red-400 " +
    "hover:border-red-500/60 hover:shadow-[0_0_14px_rgba(248,113,113,0.15)]",
};

type CommonProps = { variant?: Variant; className?: string };
type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
export type AdminButtonProps = ButtonAsButton | ButtonAsLink;

export function AdminButton({ variant = "primary", className, ...props }: AdminButtonProps) {
  const classes = cn(base, variants[variant], className);
  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return <Link href={href} className={classes} {...rest} />;
  }
  const { type = "button", ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}
