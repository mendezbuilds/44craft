import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getMyTeamProfile } from "@/lib/team-profile";
import { StatusCard } from "@/components/dashboard/status-card";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/initials";

const ACTIVITY_LABEL: Record<string, string> = {
  submitted: "Submitted for review",
  approved: "Approved and published",
  changes_requested: "Changes requested",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getMyTeamProfile(user.id);

  // First time here — no profile row yet — go straight into the editor
  // instead of showing an empty dashboard.
  if (!profile) redirect("/dashboard/profile");

  const changesRequestedNote =
    profile.status === "draft"
      ? (profile.activity.find((a) => a.type === "changes_requested")?.note ?? null)
      : null;

  return (
    <div className="flex flex-col gap-10">
      <StatusCard
        profileId={profile.id}
        status={profile.status}
        changesRequestedNote={changesRequestedNote}
      />

      {/* Profile summary */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Your profile</h2>
          <Button href="/dashboard/profile" variant="ghost">
            Edit profile
          </Button>
        </div>
        <div className="flex items-start gap-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141310] p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.14)] bg-[#0a0a08] font-display text-sm font-bold text-gold">
            {profile.photo ? (
              <Image src={profile.photo} alt="" width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              initials(profile.name)
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-ink">{profile.name}</h3>
            <p className="mb-2 text-sm text-ink-dim">{profile.roleTitle}</p>
            {profile.bio && <p className="mb-3 text-sm text-ink-dim">{profile.bio}</p>}
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured work — read-only, admin-assigned only */}
      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Featured work</h2>
        {profile.projects.length > 0 ? (
          <ul className="grid gap-3 min-[601px]:grid-cols-2">
            {profile.projects.map((project) => (
              <li
                key={project.id}
                className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141310] p-4 text-sm text-ink"
              >
                {project.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-dim">
            Nothing yet — admins attach projects to your profile once
            there are real ones to feature.
          </p>
        )}
      </section>

      {/* Activity log */}
      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Activity</h2>
        {profile.activity.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {profile.activity.map((entry) => (
              <li key={entry.id} className="flex items-baseline gap-3 text-sm">
                <span className="text-ink">{ACTIVITY_LABEL[entry.type] ?? entry.type}</span>
                <span className="text-ink-dim">
                  {entry.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-dim">No activity yet.</p>
        )}
      </section>

      {/* Account settings */}
      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Account settings</h2>
        <p className="mb-4 text-sm text-ink-dim">Signed in as {user.email}.</p>
        <ChangePasswordForm />
      </section>

      {user.role === "admin" && (
        <Link href="/admin" className="text-sm text-ink-dim underline hover:text-ink">
          Go to admin
        </Link>
      )}
    </div>
  );
}
