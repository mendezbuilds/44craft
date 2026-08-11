"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  profileId: string;
  status: "draft" | "pending" | "published";
  changesRequestedNote: string | null;
};

const COPY: Record<Props["status"], { title: string; body: string }> = {
  draft: {
    title: "Changes requested",
    body: "An admin sent this back for a tweak — update your profile and resubmit.",
  },
  pending: {
    title: "Under review",
    body: "Submitted — an admin will publish it or send back a note.",
  },
  published: {
    title: "Live",
    body: "Your profile is public on the site.",
  },
};

/**
 * The one earned animation in the dashboard (SPEC.md Section 2/9): a
 * brief gradient glow the first time a profile flips to published, then
 * calm from then on. "First time" is tracked client-side via localStorage
 * since there's no dedicated DB flag for it — fine for a once-per-browser
 * nicety like this.
 *
 * Checked-and-consumed in a lazy useState initializer, not an effect —
 * this needs to run exactly once per mount (read the flag, and if unset,
 * set it and remember that for this render), which an effect can't do
 * without a synchronous setState-in-effect the lint rules (rightly) flag.
 * No hydration-mismatch risk here despite reading a browser-only API
 * during render: Framer Motion's `animate` prop doesn't change what
 * actually gets SSR-rendered (animation is entirely client-driven after
 * mount), unlike e.g. conditionally rendering different DOM.
 */
export function StatusCard({ profileId, status, changesRequestedNote }: Props) {
  const [justWentLive] = useState(() => {
    if (typeof window === "undefined" || status !== "published") return false;
    const key = `44craft:seen-live:${profileId}`;
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, "1");
    return true;
  });

  const copy = COPY[status];

  return (
    <motion.div
      animate={
        justWentLive
          ? { boxShadow: ["0 0 0 rgba(212,175,55,0)", "0 0 40px rgba(212,175,55,0.35)", "0 0 0 rgba(212,175,55,0)"] }
          : undefined
      }
      transition={{ duration: 1.8, ease: "easeInOut" }}
      className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141310] p-6"
    >
      <div className="mb-1 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "published" ? "bg-gold" : status === "pending" ? "bg-ink-dim" : "bg-red-400/70"
          }`}
        />
        <h2 className="font-display text-base font-bold text-ink">{copy.title}</h2>
      </div>
      <p className="text-sm text-ink-dim">{copy.body}</p>
      {status === "draft" && changesRequestedNote && (
        <p className="mt-3 rounded-[6px] border border-[rgba(255,255,255,0.1)] bg-black/25 px-4 py-3 text-sm text-ink">
          &ldquo;{changesRequestedNote}&rdquo;
        </p>
      )}
    </motion.div>
  );
}
