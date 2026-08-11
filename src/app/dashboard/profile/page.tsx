import { requireUser } from "@/lib/auth";
import { getMyTeamProfile, type ProfileSnapshot, type Socials } from "@/lib/team-profile";
import { ProfileEditor } from "@/components/profile-editor";

export default async function DashboardProfilePage() {
  const user = await requireUser();
  const profile = await getMyTeamProfile(user.id);

  // No row yet (never submitted) = blank editor. Invite doesn't capture a
  // name (only email), so there's nothing real to pre-fill there — SPEC.md's
  // "name may be pre-filled from the invite" only applies once/if the
  // invite flow starts collecting one.
  const initial: ProfileSnapshot = profile
    ? {
        name: profile.name,
        roleTitle: profile.roleTitle,
        photo: profile.photo,
        bio: profile.bio ?? "",
        skills: profile.skills,
        socials: (profile.socials as Socials | null) ?? {},
      }
    : { name: "", roleTitle: "", photo: null, bio: "", skills: [], socials: {} };

  return (
    <div>
      <h1 className="mb-8 font-display text-2xl font-bold text-ink">
        {profile ? "Edit profile" : "Set up your profile"}
      </h1>
      <ProfileEditor initial={initial} />
    </div>
  );
}
