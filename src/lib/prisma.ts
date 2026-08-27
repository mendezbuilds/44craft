import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// `max` caps how many connections *this one pg.Pool* can ever open —
// left at pg's own default (10), this plus `next build`'s multiple
// parallel static-generation workers (each importing this module fresh,
// see the singleton note below) is exactly what blew past Supabase's
// session-mode pooler cap (fixed at 15 for this tenant, README's own
// note on why we're on session mode at all): 3 workers x up to 10
// connections each is already double the entire budget, before
// counting anything else hitting the same pooler. 3 is comfortably
// small for what this app actually needs concurrently per process.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Always cache on globalThis, not just outside production. The original
// justification for gating this to dev-only is hot-reload churn during
// `next dev` — real, but `next build`'s static-generation workers are
// ALSO NODE_ENV=production and behave like a small pool of long-lived
// processes each rendering *many* pages in sequence, not one-shot
// serverless invocations; skipping the cache there meant every page a
// given worker touched during a build re-created its own PrismaClient
// (and its own connection pool) instead of reusing one — the other half
// of what was exhausting the pool. Caching unconditionally is safe in
// genuine serverless production too: a cold start's `globalThis` is
// already empty, so this is a no-op there either way.
globalForPrisma.prisma = prisma;
