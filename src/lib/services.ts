import { prisma } from "@/lib/prisma";

// Replaces the old src/lib/data/services.ts static array — that file has
// been removed. See SPEC.md Section 6's "Services" note and
// scripts/migrate-services-to-db.ts for the full history: the static file
// was the only thing the public site ever actually rendered, completely
// disconnected from the Service table the admin CRUD manages. The
// migration script seeded that table with the same content once, and
// these query helpers replace the static array everywhere it was read.

export function getAllServices() {
  return prisma.service.findMany({ orderBy: { createdAt: "asc" } });
}

export function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({ where: { slug } });
}

// The actual skill<->service matching logic lives in service-matching.ts
// now (pure functions, no DB import) — re-exported here so every
// existing server-side `from "@/lib/services"` import keeps working
// unchanged. Client components should import service-matching.ts
// directly instead of through here — see that file's own comment for why
// (this file's prisma import isn't safe to bundle for the browser).
export {
  servicesForSkills,
  teamMembersForService,
  serviceForTag,
  projectsForService,
} from "@/lib/service-matching";
