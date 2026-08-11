/**
 * The branded shell every transactional email uses (SPEC.md Section 10:
 * "Same branded template shell for all four... logo, dark canvas, one
 * clear CTA button, short human subject lines"). Previously each sender
 * built its own bare `<p>` markup — only sendInviteAction actually sent
 * anything; approve/reject/featured never did (see the three callers of
 * this in invites/reviews/projects actions.ts).
 *
 * Table-based layout with inline styles throughout, not the app's own
 * Tailwind classes or flex/grid — email clients (Outlook desktop most of
 * all) don't reliably support either. Space Grotesk/Inter are requested
 * via a `<link>` for clients that honor it (Apple Mail, some webmail);
 * every font-family falls back to a plain sans-serif stack so nothing
 * breaks where it's ignored. Colors are the real tokens (SPEC.md Section
 * 2) as literal hex/rgba, not CSS custom properties — email clients don't
 * reliably support `var()`.
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

export function emailShell({
  preheader,
  heading,
  paragraphs,
  ctaLabel,
  ctaUrl,
  footnote,
}: {
  /** Hidden preview text most inboxes show next to the subject line. */
  preheader: string;
  heading: string;
  paragraphs: string[];
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
              <td style="background-color:${CARD};border:1px solid ${BORDER};border-radius:12px;padding:32px;">
                <h1 style="margin:0 0 16px;font-family:${DISPLAY_FONT_STACK};font-weight:700;font-size:22px;line-height:1.3;color:${INK};">${heading}</h1>
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
