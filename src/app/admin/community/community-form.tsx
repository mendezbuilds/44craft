"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses, AdminLabel } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useToastAction } from "@/lib/use-toast-action";
import { uploadCommunityImageAction } from "./actions";
import type { CommunityFormState } from "./actions";

type CommunityFormValues = {
  id?: string;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD, for an <input type="date">
  image: string;
};

const initialState: CommunityFormState = {};
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export function CommunityForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: CommunityFormState, formData: FormData) => Promise<CommunityFormState>;
  defaultValues: CommunityFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useToastAction(action, initialState);
  const { push } = useToast();

  const [image, setImage] = useState(defaultValues.image);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onImageSelected(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadCommunityImageAction(formData);
    setUploading(false);
    if (result.error) {
      push({ type: "error", message: result.error });
      return;
    }
    if (result.url) {
      setImage(result.url);
      push({ type: "success", message: "Image uploaded." });
    }
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {defaultValues.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <AdminLabel>
        Title
        <input name="title" required defaultValue={defaultValues.title} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Date
        <input type="date" name="date" required defaultValue={defaultValues.date} className={adminFieldClasses} />
      </AdminLabel>

      <AdminLabel>
        Body
        <textarea
          name="body"
          required
          rows={6}
          defaultValue={defaultValues.body}
          className={`${adminFieldClasses} resize-none`}
        />
      </AdminLabel>

      {/* <label> wraps only the field's own text + control now — the
          button row moved out too, same as the hint. See
          project-form.tsx's identical note for the full reasoning
          (button text was folding into the accessible name same as the
          hint sentence was). */}
      <div className="flex flex-col gap-1.5">
        <AdminLabel>
          Image URL (optional)
          <input
            name="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={adminFieldClasses}
            placeholder="https://<project>.supabase.co/storage/v1/object/public/…"
            aria-describedby="image-hint"
          />
        </AdminLabel>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageSelected(file);
              e.target.value = "";
            }}
          />
          <AdminButton
            type="button"
            variant="ghost"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 px-3 py-1 text-xs"
          >
            {uploading && <Spinner className="h-3 w-3" />}
            {uploading ? "Uploading…" : "Upload image"}
          </AdminButton>
          {image && (
            <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-[4px] border border-[rgba(255,255,255,0.14)] bg-[#141310]">
              <Image src={image} alt="" fill className="object-cover" />
            </div>
          )}
        </div>
        <span id="image-hint" className="text-xs text-ink-dim">
          Upload an image, or paste a Supabase Storage URL directly.
        </span>
      </div>

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
