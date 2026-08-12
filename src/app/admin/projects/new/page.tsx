import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../project-form";
import { createProjectAction } from "../actions";

export default async function NewProjectPage() {
  const teamOptions = await prisma.teamProfile.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/projects" className="text-sm text-ink-dim hover:text-ink">
          ← Projects
        </Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink">New project</h1>
      <ProjectForm
        action={createProjectAction}
        defaultValues={{
          slug: "",
          title: "",
          description: "",
          coverImage: "",
          gallery: [],
          tags: [],
          liveUrl: "",
          teamMemberIds: [],
        }}
        teamOptions={teamOptions}
        submitLabel="Create project"
      />
    </div>
  );
}
