import Link from "next/link";
import { CommunityForm } from "../community-form";
import { createCommunityUpdateAction } from "../actions";

export default function NewCommunityUpdatePage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/community" className="text-sm text-ink-dim hover:text-ink">
          ← Community updates
        </Link>
      </div>
      <h1 className="font-display text-xl font-bold text-ink">New update</h1>
      <CommunityForm
        action={createCommunityUpdateAction}
        defaultValues={{ title: "", body: "", date: today, image: "" }}
        submitLabel="Create update"
      />
    </div>
  );
}
