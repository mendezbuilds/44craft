"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AdminButton } from "@/components/admin/admin-button";
import { adminFieldClasses, AdminLabel } from "@/components/admin/admin-field";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useToastAction } from "@/lib/use-toast-action";
import { uploadProjectCoverAction, uploadProjectGalleryImageAction } from "./actions";
import type { ProjectFormState } from "./actions";

type TeamOption = { id: string; name: string };

type ProjectFormValues = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  gallery: string[];
  tags: string[];
  liveUrl: string;
  teamMemberIds: string[];
};

const initialState: ProjectFormState = {};
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/**
 * Cover image and gallery are controlled (everything else in this form
 * stays uncontrolled/defaultValue, submitted via the plain <form action>)
 * specifically so the upload buttons have somewhere to write the
 * resulting Supabase Storage URL back to. The text fields underneath
 * stay visible and editable, not replaced by the upload button — someone
 * who already has a Storage URL from elsewhere can still paste it
 * directly, same fallback that existed before this.
 */
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
  const { push } = useToast();

  const [coverImage, setCoverImage] = useState(defaultValues.coverImage);
  const [galleryText, setGalleryText] = useState(defaultValues.gallery.join("\n"));
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function onCoverSelected(file: File) {
    setUploadingCover(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProjectCoverAction(formData);
    setUploadingCover(false);
    if (result.error) {
      push({ type: "error", message: result.error });
      return;
    }
    if (result.url) {
      setCoverImage(result.url);
      push({ type: "success", message: "Cover image uploaded." });
    }
  }

  async function onGalleryFilesSelected(files: FileList) {
    setUploadingGallery(true);
    const uploaded: string[] = [];
    let errorCount = 0;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProjectGalleryImageAction(formData);
      if (result.url) uploaded.push(result.url);
      if (result.error) errorCount++;
    }
    setUploadingGallery(false);
    if (uploaded.length > 0) {
      setGalleryText((prev) => (prev.trim() ? `${prev.trimEnd()}\n${uploaded.join("\n")}` : uploaded.join("\n")));
      push({ type: "success", message: `${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded.` });
    }
    if (errorCount > 0) {
      push({ type: "error", message: `${errorCount} image${errorCount === 1 ? "" : "s"} failed to upload.` });
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

      {/* <label> now wraps only the field's own text + control — nothing
          else. A label's accessible name concatenates all of its text
          content, including nested interactive elements, so both the
          hint sentence *and* the upload button's own text ("Upload
          image") were folding into "Cover image URL"'s announced name.
          The button row and hint are both siblings now, same reasoning
          applied consistently rather than just to the hint. */}
      <div className="flex flex-col gap-1.5">
        <AdminLabel>
          Cover image URL
          <input
            name="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className={adminFieldClasses}
            placeholder="https://<project>.supabase.co/storage/v1/object/public/…"
            aria-describedby="coverImage-hint"
          />
        </AdminLabel>
        <div className="flex items-center gap-3">
          <input
            ref={coverInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onCoverSelected(file);
              e.target.value = ""; // lets the same file be re-selected later
            }}
          />
          <AdminButton
            type="button"
            variant="ghost"
            disabled={uploadingCover}
            onClick={() => coverInputRef.current?.click()}
            className="gap-2 px-3 py-1 text-xs"
          >
            {uploadingCover && <Spinner className="h-3 w-3" />}
            {uploadingCover ? "Uploading…" : "Upload image"}
          </AdminButton>
          {coverImage && (
            <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-[4px] border border-[rgba(255,255,255,0.14)] bg-[#141310]">
              <Image src={coverImage} alt="" fill className="object-cover" />
            </div>
          )}
        </div>
        <span id="coverImage-hint" className="text-xs text-ink-dim">
          Upload an image, or paste a Supabase Storage URL directly.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <AdminLabel>
          Gallery (one image URL per line, optional)
          <textarea
            name="gallery"
            rows={4}
            value={galleryText}
            onChange={(e) => setGalleryText(e.target.value)}
            placeholder={"https://<project>.supabase.co/storage/v1/object/public/…\nhttps://<project>.supabase.co/storage/v1/object/public/…"}
            className={`${adminFieldClasses} resize-none`}
            aria-describedby="gallery-hint"
          />
        </AdminLabel>
        <div className="flex items-center gap-3">
          <input
            ref={galleryInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) onGalleryFilesSelected(files);
              e.target.value = "";
            }}
          />
          <AdminButton
            type="button"
            variant="ghost"
            disabled={uploadingGallery}
            onClick={() => galleryInputRef.current?.click()}
            className="gap-2 px-3 py-1 text-xs"
          >
            {uploadingGallery && <Spinner className="h-3 w-3" />}
            {uploadingGallery ? "Uploading…" : "Add images"}
          </AdminButton>
        </div>
        <span id="gallery-hint" className="text-xs text-ink-dim">
          Upload one or more images (adds to the list above), or paste Supabase Storage URLs directly.
        </span>
      </div>

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
