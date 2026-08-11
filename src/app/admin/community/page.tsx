import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminButton } from "@/components/admin/admin-button";
import { AdminPanel } from "@/components/admin/admin-panel";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { ToastFromQuery } from "@/components/ui/toast-from-query";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { deleteCommunityUpdateAction } from "./actions";

const TOAST_MESSAGES = { created: "Update created.", updated: "Update saved." };

export default async function AdminCommunityPage() {
  const updates = await prisma.communityUpdate.findMany({ orderBy: { date: "desc" } });

  return (
    <Reveal onMount className="flex flex-col gap-6">
      <ToastFromQuery messages={TOAST_MESSAGES} />
      <RevealItem className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Community updates</h1>
        <AdminButton href="/admin/community/new">New update</AdminButton>
      </RevealItem>

      {updates.length === 0 ? (
        <RevealItem>
          <p className="text-sm text-ink-dim">No updates yet.</p>
        </RevealItem>
      ) : (
        <RevealItem>
          <table className="hidden w-full border-collapse text-sm min-[640px]:table">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-left text-ink-dim">
                <th className="py-2 pr-4 font-normal">Title</th>
                <th className="py-2 pr-4 font-normal">Date</th>
                <th className="py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update) => (
                <tr key={update.id} className="border-b border-[rgba(255,255,255,0.06)] align-top">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/community/${update.id}`} className="text-ink underline-offset-2 hover:underline">
                      {update.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-ink-dim">
                    {update.date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <AdminButton href={`/admin/community/${update.id}`} variant="ghost" className="px-3 py-1 text-xs">
                        Edit
                      </AdminButton>
                      <DeleteRowButton
                        id={update.id}
                        action={deleteCommunityUpdateAction}
                        successMessage="Update deleted."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="flex flex-col gap-3 min-[640px]:hidden">
            {updates.map((update) => (
              <li key={update.id}>
                <AdminPanel className="p-4">
                  <Link href={`/admin/community/${update.id}`} className="font-display text-sm font-bold text-ink underline-offset-2 hover:underline">
                    {update.title}
                  </Link>
                  <p className="mb-3 text-sm text-ink-dim">
                    {update.date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  <div className="flex gap-3">
                    <AdminButton href={`/admin/community/${update.id}`} variant="ghost" className="px-3 py-1 text-xs">
                      Edit
                    </AdminButton>
                    <DeleteRowButton
                      id={update.id}
                      action={deleteCommunityUpdateAction}
                      successMessage="Update deleted."
                    />
                  </div>
                </AdminPanel>
              </li>
            ))}
          </ul>
        </RevealItem>
      )}
    </Reveal>
  );
}
