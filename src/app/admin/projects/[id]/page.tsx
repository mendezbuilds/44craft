import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../project-form";
import { updateProjectAction } from "../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [project, teamOptions] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { teamMembers: { select: { id: true } } } }),
    prisma.teamProfile.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-ink-dim hover:text-ink">
          ← Projects
        </Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink">Edit project</h1>
      <ProjectForm
        action={updateProjectAction}
        defaultValues={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          description: project.description,
          coverImage: project.coverImage ?? "",
          tags: project.tags,
          liveUrl: project.liveUrl ?? "",
          teamMemberIds: project.teamMembers.map((m) => m.id),
        }}
        teamOptions={teamOptions}
        submitLabel="Save changes"
      />
    </div>
  );
}
