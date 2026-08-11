import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminButton } from "@/components/admin/admin-button";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { ToastFromQuery } from "@/components/ui/toast-from-query";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { deleteProjectAction } from "./actions";

const TOAST_MESSAGES = { created: "Project created.", updated: "Project updated." };

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { teamMembers: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Reveal onMount className="flex flex-col gap-6">
      <ToastFromQuery messages={TOAST_MESSAGES} />
      <RevealItem className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Projects</h1>
        <AdminButton href="/admin/projects/new">New project</AdminButton>
      </RevealItem>

      {projects.length === 0 ? (
        <RevealItem>
          <p className="text-sm text-ink-dim">No projects yet.</p>
        </RevealItem>
      ) : (
        <RevealItem>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-left text-ink-dim">
                <th className="py-2 pr-4 font-normal">Title</th>
                <th className="py-2 pr-4 font-normal">Tags</th>
                <th className="py-2 pr-4 font-normal">Team</th>
                <th className="py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-[rgba(255,255,255,0.06)] align-top">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/projects/${project.id}`} className="text-ink underline-offset-2 hover:underline">
                      {project.title}
                    </Link>
                  </td>
                  <td className="max-w-[220px] py-3 pr-4 text-ink-dim">{project.tags.join(", ") || "—"}</td>
                  <td className="max-w-[220px] py-3 pr-4 text-ink-dim">
                    {project.teamMembers.map((m) => m.name).join(", ") || "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <AdminButton href={`/admin/projects/${project.id}`} variant="ghost" className="px-3 py-1 text-xs">
                        Edit
                      </AdminButton>
                      <DeleteRowButton id={project.id} action={deleteProjectAction} successMessage="Project deleted." />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </RevealItem>
      )}
    </Reveal>
  );
}
