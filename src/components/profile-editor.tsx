"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { uploadProfilePhotoAction, submitProfileAction } from "@/lib/team-profile-actions";
import { profileSnapshotSchema, socialsSchema } from "@/lib/validation";
import type { ProfileSnapshot, Socials } from "@/lib/team-profile";

const MAX_SKILLS = 20;

const STEPS = ["Photo", "Name & role", "Bio", "Skills", "Socials", "Featured work"] as const;

const SOCIAL_FIELDS: { key: keyof Socials; label: string; placeholder: string }[] = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/yourname" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourname" },
  { key: "x", label: "X", placeholder: "https://x.com/yourname" },
  { key: "website", label: "Website", placeholder: "https://yoursite.com" },
];

const inputClasses =
  "w-full rounded-[6px] border border-[rgba(255,255,255,0.16)] bg-transparent px-4 py-3 text-sm text-ink " +
  "outline-none transition-[border-color,box-shadow] duration-200 " +
  "focus:border-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]";

/**
 * The one guided editor used for both first-time onboarding and later edits
 * (SPEC.md Section 7/9 — "opens the same guided multi-step editor"). All
 * six steps collect into one in-memory ProfileSnapshot; nothing touches
 * the database until the final "Submit for review" — no per-step
 * autosave, so closing mid-wizard loses progress. Acceptable trade for
 * this phase; revisit if that turns out to matter in practice.
 *
 * Socials step: the data model (Socials type, profileSnapshotSchema,
 * submitProfileAction, the admin review diff, and the public /team/[slug]
 * page's social-links section) already fully supported this field — only
 * the editor itself never collected it, so `form.socials` sat permanently
 * empty for every member. Added on request.
 */
export function ProfileEditor({ initial }: { initial: ProfileSnapshot }) {
  const router = useRouter();
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileSnapshot>(initial);
  const [skillInput, setSkillInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof ProfileSnapshot>(key: K, value: ProfileSnapshot[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateSocial(key: keyof Socials, value: string) {
    update("socials", { ...form.socials, [key]: value });
  }

  // Runs the *exact* schema submitProfileAction validates server-side,
  // not a hand-rolled approximation that could quietly drift from it —
  // this is what was actually missing before. Name/role had no client
  // check against the server's 80-char cap at all, so someone could
  // sail through step 1, then every later step, and only find out at
  // the very last one (wherever "Submit for review" happens to live —
  // currently Featured Work) that something several steps back was
  // wrong. The error rendered at the bottom of *whatever step you're
  // currently on* when that happened, which is why it looked like a
  // Featured Work bug specifically — it wasn't a stray field error
  // scoped to the wrong step, it was the *only* validation that had
  // ever run, running too late to matter to the step it displayed on.
  const fieldErrors = useMemo(() => {
    const result = profileSnapshotSchema.safeParse(form);
    return result.success ? {} : result.error.flatten().fieldErrors;
  }, [form]);

  // Same schema, parsed on its own — gives a per-platform message (which
  // of github/linkedin/x/website is actually wrong) instead of just
  // "something in socials failed," which fieldErrors.socials alone would
  // reduce it to (profileSnapshotSchema.flatten() only groups by the
  // top-level key).
  const socialErrors = useMemo(() => {
    const result = socialsSchema.safeParse(form.socials);
    return result.success ? {} : result.error.flatten().fieldErrors;
  }, [form.socials]);

  // Which step a field actually lives on — used so a still-invalid final
  // state (only reachable from data that predates this fix, e.g. a name
  // saved before the 80-char cap existed) points back to a specific step
  // instead of just disabling Submit with no explanation.
  const FIELD_STEP: Record<string, number> = { photo: 0, name: 1, roleTitle: 1, bio: 2, skills: 3, socials: 4 };
  const firstInvalidStep = Object.keys(fieldErrors)
    .map((key) => FIELD_STEP[key])
    .filter((s): s is number => s !== undefined)
    .sort((a, b) => a - b)[0];

  async function onPhotoSelected(file: File) {
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadProfilePhotoAction(formData);
    setUploading(false);
    if (result.error) {
      setError(result.error);
      push({ type: "error", message: result.error });
      return;
    }
    if (result.url) {
      update("photo", result.url);
      push({ type: "success", message: "Photo uploaded." });
    }
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || form.skills.includes(value) || form.skills.length >= MAX_SKILLS) {
      setSkillInput("");
      return;
    }
    update("skills", [...form.skills, value]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    update(
      "skills",
      form.skills.filter((s) => s !== skill),
    );
  }

  function canAdvance() {
    if (step === 1) return !fieldErrors.name && !fieldErrors.roleTitle;
    if (step === 4) return !fieldErrors.socials;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await submitProfileAction(form);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      push({ type: "error", message: result.error });
      return;
    }
    setSubmitted(true);
    push({ type: "success", message: "Submitted for review." });
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="max-w-[480px] rounded-[6px] border border-[rgba(212,175,55,0.3)] bg-black/25 px-6 py-8">
        <h2 className="mb-2 font-display text-lg font-bold text-ink">
          Your profile is under review
        </h2>
        <p className="text-sm text-ink-dim">
          An admin will take a look and either publish it or send back a
          note. You&apos;ll see the status update on your dashboard.
        </p>
        <Button href="/dashboard" variant="primary" className="mt-6">
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[560px]">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div
              className={`h-[3px] rounded-full transition-colors ${
                i <= step ? "bg-gold" : "bg-[rgba(255,255,255,0.12)]"
              }`}
            />
            <span className="hidden text-xs text-ink-dim min-[601px]:block">{label}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="mb-1 font-display text-lg font-bold text-ink">Photo</h2>
          <p className="mb-5 text-sm text-ink-dim">A real photo, when you have one ready.</p>

          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.14)] bg-[#141310]">
              {form.photo ? (
                <Image src={form.photo} alt="" width={96} height={96} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-ink-dim">No photo</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onPhotoSelected(file);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                {uploading && <Spinner />}
                {uploading ? "Uploading…" : form.photo ? "Change photo" : "Upload photo"}
              </Button>
              <p className="mt-2 text-xs text-ink-dim">PNG, JPEG, WebP, or GIF. Up to 5MB.</p>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-ink">Name &amp; role</h2>
          <label className="flex flex-col gap-1.5 text-sm text-ink-dim">
            Name
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              maxLength={80}
              className={inputClasses}
            />
            {fieldErrors.name && (
              <span className="text-xs text-red-400">{fieldErrors.name[0]}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink-dim">
            Role
            <input
              value={form.roleTitle}
              onChange={(e) => update("roleTitle", e.target.value)}
              placeholder="e.g. Smart Contract Engineer"
              maxLength={80}
              className={inputClasses}
            />
            {fieldErrors.roleTitle && (
              <span className="text-xs text-red-400">{fieldErrors.roleTitle[0]}</span>
            )}
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-bold text-ink">Bio</h2>
          <textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={6}
            maxLength={600}
            placeholder="A few sentences about what you do and how you got here."
            className={inputClasses}
          />
          <p className="text-right text-xs text-ink-dim">{form.bio.length}/600</p>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="mb-1 font-display text-lg font-bold text-ink">Skills</h2>
          <p className="mb-4 text-sm text-ink-dim">
            {form.skills.length >= MAX_SKILLS
              ? `That's the max (${MAX_SKILLS}) — remove one to add another.`
              : "Press Enter to add each one."}
          </p>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            disabled={form.skills.length >= MAX_SKILLS}
            placeholder="e.g. Solidity"
            className={inputClasses}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <Tag key={skill} className="gap-1.5 pr-2">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="text-ink-dim hover:text-ink"
                >
                  ×
                </button>
              </Tag>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="mb-1 font-display text-lg font-bold text-ink">Socials</h2>
            <p className="text-sm text-ink-dim">All optional — leave any of these blank.</p>
          </div>
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <label key={key} className="flex flex-col gap-1.5 text-sm text-ink-dim">
              {label}
              <input
                type="url"
                value={form.socials[key] ?? ""}
                onChange={(e) => updateSocial(key, e.target.value)}
                placeholder={placeholder}
                className={inputClasses}
              />
              {socialErrors[key] && (
                <span className="text-xs text-red-400">{socialErrors[key]![0]}</span>
              )}
            </label>
          ))}
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="mb-1 font-display text-lg font-bold text-ink">Featured work</h2>
          <p className="text-sm text-ink-dim">
            Admins attach projects to your profile once there are real
            projects to feature — nothing to do here yet. You can submit
            without it.
          </p>
        </div>
      )}

      {/* Only reachable on the last step from data that predates a
          validation rule (see firstInvalidStep above) — every step you
          can actually navigate through is already gated by canAdvance(),
          so this isn't the normal path to an error, it's the fallback
          for the abnormal one. */}
      {step === STEPS.length - 1 && firstInvalidStep !== undefined && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {STEPS[firstInvalidStep]} needs a fix before this can be submitted —{" "}
          <button type="button" onClick={() => setStep(firstInvalidStep)} className="underline underline-offset-2">
            go back
          </button>
          .
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="disabled:invisible"
        >
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" variant="primary" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            disabled={submitting || firstInvalidStep !== undefined}
            onClick={handleSubmit}
            className="gap-2"
          >
            {submitting && <Spinner />}
            {submitting ? "Submitting…" : "Submit for review"}
          </Button>
        )}
      </div>
    </div>
  );
}
