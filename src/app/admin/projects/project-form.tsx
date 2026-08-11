"use client";

import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses, AdminLabel } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import type { ProjectFormState } from "./actions";

type TeamOption = { id: string; name: string };

type ProjectFormValues = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  tags: string[];
  liveUrl: string;
  teamMemberIds: string[];
};

const initialState: ProjectFormState = {};

export function ProjectForm({
  action,
  defaultValues,
  teamOptions,
  submitLabel,
}: {
  action: (prevState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  defaultValues: ProjectFormValues;
  teamOptions: TeamOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useToastAction(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <AdminLabel>
        Title
        <input name="title" required defaultValue={defaultValues.title} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Slug
        <input name="slug" required defaultValue={defaultValues.slug} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Description
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaultValues.description}
          className={`${adminFieldClasses} resize-none`}
        />
      </AdminLabel>

      <AdminLabel>
        Cover image URL
        <input name="coverImage" defaultValue={defaultValues.coverImage} className={adminFieldClasses} placeholder="https://…" />
      </AdminLabel>

      <AdminLabel>
        Live URL
        <input name="liveUrl" defaultValue={defaultValues.liveUrl} className={adminFieldClasses} placeholder="https://…" />
      </AdminLabel>

      <AdminLabel>
        Tags (comma-separated)
        <input name="tags" defaultValue={defaultValues.tags.join(", ")} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Team members
        <select
          name="teamMemberIds"
          multiple
          defaultValue={defaultValues.teamMemberIds}
          className={`${adminFieldClasses} h-32`}
        >
          {teamOptions.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </AdminLabel>

      <div>
        <AdminButton type="submit" variant="primary" disabled={pending} className="gap-2">
          {pending && <Spinner />}
          {pending ? "Saving…" : submitLabel}
        </AdminButton>
      </div>

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
