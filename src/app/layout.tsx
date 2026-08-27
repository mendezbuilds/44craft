import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { ToastProvider } from "@/components/ui/toast";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";
const SITE_DESCRIPTION =
  "44Craft is a Web3-native studio — development, marketing, and community, run by craftsmen figuring it out with no handouts. Infrastructure, not narratives.";

/**
 * Site-wide defaults. Every route below inherits this and overrides just
 * `title`/`description`/`openGraph.{title,description,images}` — Next.js
 * merges Metadata objects up the tree rather than requiring each page to
 * repeat the shared bits (siteName, type, metadataBase, etc.).
 *
 * metadataBase is required for every relative OG/Twitter image URL below
 * to resolve to an absolute one — without it Next.js warns at build time
 * and social crawlers (which don't share this app's base URL) get a
 * broken image link.
 */
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "44Craft",
    template: "%s — 44Craft",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: "44Craft",
    type: "website",
    title: "44Craft",
    description: SITE_DESCRIPTION,
    images: DEFAULT_OG_IMAGE,
  },
  twitter: {
    card: "summary_large_image",
    title: "44Craft",
    description: SITE_DESCRIPTION,
    images: DEFAULT_OG_IMAGE,
  },
  // `favicon.ico` at src/app/favicon.ico is picked up automatically by
  // Next.js's file convention — these are the additional sizes/variants
  // that convention doesn't cover (they don't live at the exact
  // `icon.png` / `apple-icon.png` paths it auto-detects), all rendered
  // from the same source as favicon.ico: DiamondMark's gold-gradient
  // square, the one recurring gradient object in the design system,
  // chosen over the full logo lockup because a mark with fine linework
  // and text turns to mush at 16–32px.
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-body">
        {/* Strips transform-based motion (translate/scale) for users with
            the OS reduced-motion preference, app-wide, while keeping
            opacity fades — see src/lib/motion.ts for why this covers the
            "static fallback" requirement instead of per-component checks. */}
        <MotionConfig reducedMotion="user">
          <ToastProvider>{children}</ToastProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
