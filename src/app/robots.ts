import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://44craft.com";

// Belt-and-suspenders alongside each private route's own `robots: noindex`
// metadata (crawlers that ignore per-page robots meta still read this).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/signin", "/accept-invite"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
