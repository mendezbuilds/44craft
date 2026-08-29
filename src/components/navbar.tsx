"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "@/lib/nav-links";
import { scrollToHashIfPresent } from "@/lib/hash-scroll";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // `document.body` (the portal target below) doesn't exist during SSR —
  // useSyncExternalStore is React's own primitive for a value that must
  // read one thing on the server and another after hydration, without the
  // extra render-then-flip-in-an-effect dance (and the lint warning that
  // comes with calling setState from inside an effect body).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={cn(
        // Breakpoint (901px) matches docs/44craft-hero-mockup.html's
        // `@media (max-width: 900px)` exactly, not Tailwind's default `md:`.
        // `sticky`, not `fixed` — fixed needs compensating top-padding on
        // content, which broke the transparent-over-hero look (a visible
        // seam of plain canvas above the hero instead of the nav floating
        // directly over it). Sticky's natural-flow position already
        // coincides with the top of the page, so it achieves the same
        // "stays pinned" behavior without that gap.
        "sticky top-0 z-50 flex items-center justify-between px-6 py-5 transition-[background-color,border-color] duration-300 min-[901px]:px-12 min-[901px]:py-[26px]",
        scrolled
          ? "border-b border-[rgba(255,255,255,0.08)] bg-canvas/90 backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Link href="/" className="flex items-center">
        {/* Real lockup (diamond + "44CRAFT"), background-removed from
            docs/1500x500 cover.png. 864x277 source aspect ratio. */}
        <Image
          src="/brand/logo-wordmark.png"
          alt="44Craft"
          width={864}
          height={277}
          priority
          className="h-7 w-auto"
        />
      </Link>

      <div className="hidden items-center gap-8 min-[901px]:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => {
              if (scrollToHashIfPresent(link.href)) e.preventDefault();
            }}
            className="text-[13.5px] font-medium text-ink-dim transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold focus-visible:outline-offset-4"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Button href="/#contact" variant="primary" className="hidden min-[901px]:inline-flex">
        Start a project
      </Button>

      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] min-[901px]:hidden"
      >
        <span
          className={cn(
            "h-px w-5 bg-ink transition-transform duration-200",
            menuOpen && "translate-y-[3px] rotate-45",
          )}
        />
        <span
          className={cn(
            "h-px w-5 bg-ink transition-transform duration-200",
            menuOpen && "-translate-y-[3px] -rotate-45",
          )}
        />
      </button>

    </nav>
      {/* Portaled straight to <body> rather than rendered inline here —
          this nav element picks up `backdrop-blur` (backdrop-filter) once
          scrolled, and a `backdrop-filter` ancestor creates a new
          containing block for `position: fixed` descendants per spec. Left
          inline, the menu would stop positioning against the real viewport
          the moment you'd scrolled past the "solidify" point, and instead
          composite at wherever the nav's own (sticky, so still
          scroll-position-dependent) box happened to be — which is exactly
          the "menu overlaps whatever section you scrolled to" bug this
          fixes. A portal has no such ancestor to inherit the problem from. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-[73px] z-50 flex flex-col gap-8 bg-canvas px-7 py-10 min-[901px]:hidden"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      setMenuOpen(false);
                      if (scrollToHashIfPresent(link.href)) e.preventDefault();
                    }}
                    className="font-display text-2xl font-bold text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button href="/#contact" variant="primary" className="mt-4 self-start">
                  Start a project
                </Button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
