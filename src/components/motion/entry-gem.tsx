"use client";

import { useEffect, useSyncExternalStore } from "react";
import { FloatingMark } from "./floating-mark";

function storageKeyFor(key: string) {
  return `44craft:seen:${key}`;
}

function hasSeen(key: string): boolean {
  return localStorage.getItem(storageKeyFor(key)) != null;
}

/**
 * Gates the mark's one-time entrance (fade/rotate/scale-in) to genuinely
 * first-time entry points — sign-in, first admin page of a session —
 * rather than replaying it every visit. Repeat visits see the mark
 * already settled (still floating, just no entrance transition). A
 * homepage load doesn't need this; every real page load already *is* a
 * first entry, so Hero renders <FloatingMark> directly with the entrance
 * always on.
 *
 * `useSyncExternalStore`: reads external mutable state (localStorage)
 * that can legitimately differ between the server snapshot and the
 * client's real value. React hydrates with `getServerSnapshot` (always
 * "seen"/settled, since the server can't know) and automatically
 * re-renders with the real client snapshot right after — no
 * hydration-mismatch risk, no manual "mounted" bookkeeping. The one-time
 * "mark as seen" write is a genuine effect (an external-system update,
 * not a setState call), so it doesn't trip the set-state-in-effect lint
 * rule a plain useState+useEffect version did.
 */
export function EntryGem({ storageKey, size }: { storageKey: string; size?: string }) {
  const seen = useSyncExternalStore(
    () => () => {},
    () => hasSeen(storageKey),
    () => true,
  );

  useEffect(() => {
    if (!seen) localStorage.setItem(storageKeyFor(storageKey), "1");
  }, [seen, storageKey]);

  return <FloatingMark playEntrance={!seen} size={size} />;
}
