"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export const ADMIN_NAV = [
  { label: "Overview", href: "/admin" },
  { label: "Invites", href: "/admin/invites" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Team", href: "/admin/team" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Services", href: "/admin/services" },
  { label: "Community", href: "/admin/community" },
];

function isActive(pathname: string, href: string) {
  // "/admin" itself needs an exact match (otherwise it'd stay highlighted
  // on every /admin/* sub-route); everything else matches its own subtree.
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * Client component (needs usePathname for the active-item state) —
 * design-correction pass: previously every nav item looked identical
 * regardless of route, no way to tell where you were. Active gets a gold
 * left-border + gold text; inactive gets a subtle gold-tinted glow on
 * hover instead of the old plain bg-white/5 flat hover.
 */
export function AdminNav({ variant }: { variant: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="flex gap-1 overflow-x-auto border-b border-[rgba(255,255,255,0.08)] px-4 py-2 min-[801px]:hidden">
        {ADMIN_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-[6px] border-b-2 px-3 py-1.5 text-sm transition-colors duration-150",
                active
                  ? "border-gold text-gold"
                  : "border-transparent text-ink-dim hover:text-ink hover:shadow-[0_0_12px_rgba(212,175,55,0.12)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-[6px] border-l-2 px-2 py-2 text-sm transition-colors duration-150",
              active
                ? "border-gold bg-white/5 font-medium text-gold"
                : "border-transparent text-ink-dim hover:border-[rgba(212,175,55,0.3)] hover:bg-white/5 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
