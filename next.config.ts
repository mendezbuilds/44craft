import type { NextConfig } from "next";

// Derived from the env var, not hardcoded to this specific project ref —
// SPEC.md Section 12: "the user creates this [Supabase project]
// themselves," so whatever project it points to should just work.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    // Profile photos (src/lib/team-profile-actions.ts) are public Storage
    // URLs on this host — next/image refuses to optimize/render images
    // from a host that isn't explicitly allow-listed.
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: {
    serverActions: {
      // Default (1MB) is too small for a profile photo upload. Matches the
      // "a sane max size — a few MB" limit enforced again client-side in
      // the upload action itself (src/lib/team-profile-actions.ts).
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
