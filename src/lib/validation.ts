import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required"),
});

export const sendInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["team", "admin"]).default("team"),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email(),
  projectType: z.string().trim().optional(),
  message: z.string().trim().min(1, "Message is required"),
});

const urlOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || z.string().url().safeParse(v).success, "Enter a valid URL");

export const socialsSchema = z.object({
  github: urlOrEmpty.optional(),
  linkedin: urlOrEmpty.optional(),
  x: urlOrEmpty.optional(),
  website: urlOrEmpty.optional(),
});

export const profileSnapshotSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  roleTitle: z.string().trim().min(1, "Role is required").max(80),
  photo: z.string().url().nullable(),
  bio: z.string().trim().max(600).optional().default(""),
  skills: z.array(z.string().trim().min(1)).max(20),
  socials: socialsSchema,
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const rejectProfileSchema = z.object({
  id: z.string().min(1),
  note: z.string().trim().min(1, "A note is required so the member knows what to change."),
});

// Admin CRUD (Projects/Services/Community) — all three now read by real
// public pages (Project/CommunityUpdate since Phase 7; Service since the
// follow-up that migrated it off a disconnected static file — see
// scripts/migrate-services-to-db.ts).
const optionalUrl = z.string().trim().url().optional().or(z.literal(""));

// next.config.ts's image allowlist only covers the Supabase Storage
// host, by design — kept that way on request rather than widened, since
// an open allowlist turns next/image's optimization proxy into a
// fetch-almost-anything vector. Any image next/image actually renders
// (Project.coverImage/gallery, CommunityUpdate.image) has to come from
// that host: upload to Supabase Storage first, then paste the resulting
// public URL — not paste any image URL. Checked here so a bad paste is a
// clear, immediate validation error in the admin form, not a runtime
// crash discovered later on the public page. Team profile photos don't
// need this check: they're never manually pasted, only ever produced by
// the real upload flow (uploadProfilePhotoAction), which already only
// writes real Storage URLs.
function isSupabaseStorageUrl(value: string): boolean {
  if (!z.string().url().safeParse(value).success) return false;
  const configuredHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : undefined;
  if (!configuredHost) return true; // Supabase not configured (e.g. this env) — nothing to check against
  return new URL(value).hostname === configuredHost;
}

const SUPABASE_URL_MESSAGE =
  "Must be a Supabase Storage URL — upload the image to Supabase Storage first, then paste the public URL here.";

const optionalSupabaseImageUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || isSupabaseStorageUrl(v), SUPABASE_URL_MESSAGE);

const requiredSupabaseImageUrl = z.string().trim().refine(isSupabaseStorageUrl, SUPABASE_URL_MESSAGE);

export const serviceSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required").max(60),
  title: z.string().trim().min(1, "Title is required").max(80),
  icon: z.string().trim().optional(),
  shortDescription: z.string().trim().min(1, "Short description is required").max(160),
  fullDescription: z.string().trim().min(1, "Full description is required"),
  deliverables: z.array(z.string().trim().min(1)).max(20),
});

export const projectSchema = z.object({
  slug: z.string().trim().min(1, "Slug is required").max(60),
  title: z.string().trim().min(1, "Title is required").max(80),
  description: z.string().trim().min(1, "Description is required"),
  coverImage: optionalSupabaseImageUrl,
  gallery: z.array(requiredSupabaseImageUrl).max(20),
  tags: z.array(z.string().trim().min(1)).max(20),
  liveUrl: optionalUrl, // external project link, not rendered via next/image — no host restriction
  teamMemberIds: z.array(z.string()).max(50),
});

export const communityUpdateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Body is required"),
  date: z.string().trim().min(1, "Date is required"),
  image: optionalSupabaseImageUrl,
});
