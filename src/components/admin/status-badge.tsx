import { cn } from "@/lib/cn";

type Tone = "neutral" | "positive" | "warning" | "negative";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "border-[rgba(255,255,255,0.14)] text-ink-dim",
  positive: "border-[rgba(255,255,255,0.3)] text-ink",
  warning: "border-[rgba(255,255,255,0.2)] text-ink-dim",
  negative: "border-red-500/30 text-red-400",
};

/**
 * Plain bordered chip, no color fills — status is communicated through
 * text + a subtle dot, not a colored badge background, keeping with
 * admin's neutral register (see admin-button.tsx for why).
 */
export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs",
        TONE_CLASSES[tone],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "positive" && "bg-ink",
          tone === "warning" && "bg-ink-dim",
          tone === "negative" && "bg-red-400",
          tone === "neutral" && "bg-ink-dim/60",
        )}
      />
      {label}
    </span>
  );
}
