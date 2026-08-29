"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/nav-links";
import { scrollToHashIfPresent } from "@/lib/hash-scroll";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { riseInItem } from "@/lib/motion";

// X and Discord are real as of Phase 9's launch audit (SPEC.md Section
// 13 previously listed both as still open). Telegram stays "#" — no real
// link exists yet, and a button that looks live but goes nowhere is
// worse than one that's honestly not there. Icon paths are the standard
// public glyphs for each platform, not fabricated marks.
const SOCIALS = [
  {
    name: "X",
    href: "https://x.com/44Craft_",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Discord",
    href: "https://discord.gg/VHhgUHd5N9",
    path: "M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  },
  {
    name: "Telegram",
    href: "#",
    path: "M21.198 2.433a2.242 2.242 0 0 0-2.259-.243L2.567 9.68c-1.394.617-1.383 2.558.017 3.156l4.19 1.784 2.06 6.377c.235.729 1.099.98 1.673.481l2.87-2.501 4.075 3.061c.902.678 2.176.166 2.372-.94l3.203-17.856a2.19 2.19 0 0 0-1.83-2.808zM17.7 6.34 9.395 13.06l-.36 3.588-1.622-5.014L17.7 6.34z",
  },
];

export function Footer() {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-[rgba(212,175,55,0.15)] bg-[#050504] pt-12 min-[901px]:mt-16 min-[901px]:pt-16">
      {/* Edge-to-edge wordmark */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex justify-center overflow-hidden">
        <div
          className="font-display text-[22vw] leading-[0.75] font-black tracking-tighter text-transparent opacity-40 select-none"
          style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.04)" }}
          aria-hidden="true"
        >
          44CRAFT
        </div>
      </div>

      <Reveal
        amount={0.2}
        className="relative z-10 mx-auto max-w-[1400px] px-6 pb-12 min-[901px]:px-12 min-[901px]:pb-16"
      >
        <div className="grid gap-10 min-[901px]:grid-cols-12 min-[901px]:gap-8">
          {/* Brand Col */}
          <div className="min-[901px]:col-span-5">
            <RevealItem>
              <Image
                src="/brand/logo-wordmark.png"
                alt="44Craft"
                width={864}
                height={277}
                className="mb-4 h-8 w-auto"
              />
              <p className="max-w-[320px] text-[17px] leading-[1.6] text-ink-dim">
                Craftsmen figuring it out with no handouts. Web3
                infrastructure, marketing, and community building.
              </p>
            </RevealItem>
          </div>

          {/* Navigation Col */}
          <div className="min-[901px]:col-span-3 min-[901px]:col-start-7">
            <RevealItem className="mb-3 font-mono text-xs tracking-[3px] text-[#d4af37] uppercase">
              Navigation
            </RevealItem>
            <motion.nav variants={riseInItem} className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (scrollToHashIfPresent(link.href)) e.preventDefault();
                  }}
                  className="text-base font-medium text-ink-dim transition-all duration-300 hover:translate-x-1 hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </motion.nav>
          </div>

          {/* Socials Col */}
          <div className="min-[901px]:col-span-2">
            <RevealItem className="mb-3 font-mono text-xs tracking-[3px] text-[#d4af37] uppercase">
              Socials
            </RevealItem>
            <RevealItem className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  {...(social.href !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] text-ink-dim transition-colors duration-200 hover:border-[rgba(212,175,55,0.45)] hover:text-gold"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </RevealItem>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="mt-10 flex flex-col items-center justify-between border-t border-white/5 pt-6 min-[901px]:flex-row">
          <p className="text-sm text-ink-dim/70">
            © {new Date().getFullYear()} 44Craft. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 text-sm text-ink-dim/70 min-[901px]:mt-0">
            <a href="#" className="transition-colors hover:text-ink">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Terms of Service
            </a>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
