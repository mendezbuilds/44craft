import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The Spotify/Apple-Music album-art pattern: a photo with an unknown,
 * arbitrary aspect ratio needs to display *whole*, never cropped, but a
 * plain `object-contain` on a flat background reads as an obvious
 * letterbox. Two copies of the same photo instead — a blurred, scaled-up
 * `object-cover` copy fills the entire frame as its own atmosphere/
 * background, and a sharp `object-contain` copy sits on top showing the
 * complete, uncropped image.
 *
 * Replaces a single `object-cover` <Image> that cropped to a fixed focal
 * point — fine for a photo already composed for it (a centered circular
 * vignette shot, say), but arbitrary uploads don't all share that
 * composition: a close portrait crop could just as easily cut off hair
 * at the top. This guarantees every photo displays intact regardless of
 * its original framing, with zero manual per-photo adjustment needed
 * from whoever uploads it.
 *
 * Caller supplies the frame (aspect ratio, rounded corners, border,
 * overflow-hidden, `relative` positioning) exactly as before — this only
 * fills that frame's content, it doesn't rebuild it.
 */
export function TeamPhoto({
  src,
  alt = "",
  sizes,
  hoverZoom = false,
}: {
  src: string;
  alt?: string;
  sizes?: string;
  /** Applies the existing group-hover zoom to the blurred backdrop layer
   * only — the foreground `object-contain` copy doesn't grow on hover
   * the way a full-bleed `object-cover` photo used to; scaling a
   * letterboxed image within its own fixed box has nothing to zoom
   * *into*, so the backdrop carries that motion instead. */
  hoverZoom?: boolean;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        className={cn(
          "scale-125 object-cover blur-2xl transition-transform duration-500",
          hoverZoom && "group-hover:scale-[1.35]",
        )}
      />
      <div className="absolute inset-0 bg-[rgba(10,10,8,0.4)]" aria-hidden="true" />
      <Image src={src} alt={alt} fill sizes={sizes} className="relative object-contain" />
    </>
  );
}
