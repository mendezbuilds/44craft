/**
 * The branded shell every transactional email uses (SPEC.md Section 10:
 * "Same branded template shell for all four... logo, dark canvas, one
 * clear CTA button, short human subject lines"). All four triggers —
 * invite sent, profile approved, changes requested, featured in a
 * project — render through this one function; nothing builds its own
 * one-off HTML string.
 *
 * Table-based layout with inline styles throughout, not the app's own
 * Tailwind classes or flex/grid — email clients (Outlook desktop most of
 * all) don't reliably support either. Space Grotesk/Inter are requested
 * via a `<link>` for clients that honor it (Apple Mail, some webmail);
 * every font-family falls back to a plain sans-serif stack so nothing
 * breaks where it's ignored. Colors are the real tokens (SPEC.md Section
 * 2) as literal hex/rgba, not CSS custom properties — email clients don't
 * reliably support `var()`.
 *
 * Two brand touches beyond plain text in a box, both raster rather than
 * CSS so they survive Outlook: a solid gold strip across the top of the
 * card (SPEC.md's "gold correction" — gold as a flat accent, never a
 * gradient fill on text/backgrounds outside the mark itself), and the
 * diamond mark image next to a small status pill (LIVE / FEATURED /
 * etc.) instead of a plain heading, echoing the "small accent dot before
 * eyebrow labels" pattern from the site's own DiamondMark component.
 */

const CANVAS = "#0A0A08";
const INK = "#F2EEFF";
const INK_DIM = "#B7B2C9";
const GOLD = "#D4AF37";
const CARD = "#141310";
const BORDER = "rgba(255,255,255,0.08)";

const FONT_STACK = "'Inter', Arial, Helvetica, sans-serif";
const DISPLAY_FONT_STACK = "'Space Grotesk', Arial, Helvetica, sans-serif";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";
const LOGO_URL = `${APP_URL}/brand/logo-wordmark.png`;
const DIAMOND_URL = `${APP_URL}/brand/logo-mark.png`;

export function emailShell({
  preheader,
  statusLabel,
  heading,
  paragraphs,
  image,
  ctaLabel,
  ctaUrl,
  footnote,
}: {
  /** Hidden preview text most inboxes show next to the subject line. */
  preheader: string;
  /** Short uppercase pill above the heading — "LIVE", "FEATURED", etc. */
  statusLabel: string;
  heading: string;
  paragraphs: string[];
  /** Optional visual (currently: a featured project's cover image). */
  image?: { src: string; alt: string };
  ctaLabel: string;
  ctaUrl: string;
  /** Small print under the CTA — expiry notices, "ignore if this wasn't you," etc. */
  footnote?: string;
}): string {
  const bodyHtml = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:${INK_DIM};">${p}</p>`,
    )
    .join("");

  const imageHtml = image
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <tr>
          <td>
            <img src="${image.src}" alt="${image.alt}" width="416" style="display:block;width:100%;max-width:416px;height:auto;border-radius:8px;border:1px solid ${BORDER};" />
          </td>
        </tr>
      </table>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background-color:${CANVAS};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CANVAS};">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr>
              <td align="center" style="padding-bottom:32px;">
                <img src="${LOGO_URL}" alt="44Craft" width="128" height="41" style="display:block;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="background-color:${GOLD};border-radius:12px 12px 0 0;height:4px;line-height:4px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background-color:${CARD};border:1px solid ${BORDER};border-top:none;border-radius:0 0 12px 12px;padding:32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
                  <tr>
                    <td style="border:1px solid ${BORDER};border-radius:999px;padding:5px 12px 5px 9px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-right:6px;vertical-align:middle;">
                            <img src="${DIAMOND_URL}" width="10" height="10" alt="" style="display:block;" />
                          </td>
                          <td style="vertical-align:middle;font-family:${FONT_STACK};font-size:11px;font-weight:600;letter-spacing:0.08em;color:${INK_DIM};text-transform:uppercase;">${statusLabel}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <h1 style="margin:0 0 16px;font-family:${DISPLAY_FONT_STACK};font-weight:700;font-size:22px;line-height:1.3;color:${INK};">${heading}</h1>
                ${imageHtml}
                ${bodyHtml}
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                  <tr>
                    <td style="border-radius:6px;background-color:${INK};">
                      <a
                        href="${ctaUrl}"
                        style="display:inline-block;padding:12px 24px;font-family:${FONT_STACK};font-weight:600;font-size:14px;color:${CANVAS};text-decoration:none;border-radius:6px;"
                      >${ctaLabel}</a>
                    </td>
                  </tr>
                </table>
                ${footnote ? `<p style="margin:20px 0 0;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:${INK_DIM};opacity:0.7;">${footnote}</p>` : ""}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:28px;">
                <p style="margin:0;font-family:${FONT_STACK};font-size:12px;color:${INK_DIM};opacity:0.6;">
                  44Craft — craftsmen figuring it out with no handouts.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Exported in case a future template needs the raw tokens rather than the
// whole shell (e.g. a plain-text-only fallback).
export const EMAIL_COLORS = { CANVAS, INK, INK_DIM, GOLD, CARD, BORDER };
