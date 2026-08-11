import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CommunityForm } from "../community-form";
import { updateCommunityUpdateAction } from "../actions";

export default async function EditCommunityUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const update = await prisma.communityUpdate.findUnique({ where: { id } });
  if (!update) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/community" className="text-sm text-ink-dim hover:text-ink">
          ← Community updates
        </Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink">Edit update</h1>
      <CommunityForm
        action={updateCommunityUpdateAction}
        defaultValues={{
          id: update.id,
          title: update.title,
          body: update.body,
          date: update.date.toISOString().slice(0, 10),
          image: update.image ?? "",
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
