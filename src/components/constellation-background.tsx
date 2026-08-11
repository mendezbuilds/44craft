import { cn } from "@/lib/cn";

/**
 * The dark canvas's background texture, everywhere it appears: thin lines
 * connecting scattered nodes — pulled from the logo's background artwork,
 * not a grid. Coordinates and opacities are ported 1:1 from
 * docs/44craft-hero-mockup.html so this reads exactly like the approved
 * reference.
 *
 * Purely decorative — aria-hidden, absolutely positioned, zero layout
 * impact. Place it as the first child of a `relative` ancestor.
 */
export function ConstellationBackground({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1280 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="rgba(255,255,255,0.06)" strokeWidth={1}>
        <line x1={80} y1={60} x2={230} y2={140} />
        <line x1={230} y1={140} x2={150} y2={280} />
        <line x1={230} y1={140} x2={340} y2={90} />
        <line x1={340} y1={90} x2={420} y2={240} />
        <line x1={600} y1={60} x2={760} y2={180} />
        <line x1={760} y1={180} x2={880} y2={80} />
        <line x1={880} y1={80} x2={1030} y2={150} />
        <line x1={60} y1={420} x2={240} y2={520} />
        <line x1={150} y1={280} x2={60} y2={420} />
      </g>
      <g fill="rgba(255,255,255,0.22)">
        <circle cx={80} cy={60} r={2} />
        <circle cx={230} cy={140} r={2} />
        <circle cx={150} cy={280} r={2} />
        <circle cx={340} cy={90} r={2} />
        <circle cx={420} cy={240} r={2} />
        <circle cx={600} cy={60} r={2} />
        <circle cx={760} cy={180} r={2} />
        <circle cx={880} cy={80} r={2} />
        <circle cx={1030} cy={150} r={2} />
        <circle cx={60} cy={420} r={2} />
        <circle cx={240} cy={520} r={2} />
      </g>
    </svg>
  );
}
