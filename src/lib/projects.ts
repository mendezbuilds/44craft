import { prisma } from "@/lib/prisma";

// Unlike TeamProfile, Project has no draft/pending/published workflow —
// SPEC.md Section 8 lists it as plain admin CRUD, no review step. Every row
// in the table is already what the public site shows; there's no separate
// "published" filter to apply here.

const teamMemberSelect = { slug: true, name: true, photo: true } as const;

export function getAllProjects() {
  return prisma.project.findMany({
    include: { teamMembers: { select: teamMemberSelect } },
    orderBy: { createdAt: "desc" },
  });
}

export function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: { teamMembers: { select: teamMemberSelect } },
  });
}
