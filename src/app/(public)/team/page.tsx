import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { TeamCard } from "@/components/team-card";
import { getPublishedTeamProfiles } from "@/lib/team-profile";

const DESCRIPTION = "The people building 44Craft — the team behind the work, not a stock-photo about page.";

export const metadata: Metadata = {
  title: "Team",
  description: DESCRIPTION,
  openGraph: { title: "Team — 44Craft", description: DESCRIPTION },
};

export default async function TeamPage() {
  const profiles = await getPublishedTeamProfiles();

  return (
    <Section className="py-24 min-[901px]:py-32">
      <h1 className="mb-4 text-[clamp(32px,5vw,52px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
        Team
      </h1>
      <p className="mb-12 max-w-[520px] text-[17px] leading-[1.6] text-ink-dim">
        Craftsmen figuring it out with no handouts.
      </p>

      {/* items-start — see team-teaser-grid.tsx's comment on the same
          grid class; cards aren't uniformly aspect-locked anymore. */}
      {profiles.length > 0 ? (
        <div className="grid grid-cols-2 items-start gap-6 min-[601px]:grid-cols-3 min-[901px]:grid-cols-4">
          {profiles.map((profile) => (
            <TeamCard
              key={profile.id}
              member={{
                slug: profile.slug,
                name: profile.name,
                roleTitle: profile.roleTitle,
                photo: profile.photo,
                skills: profile.skills,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-dim">No published profiles yet.</p>
      )}
    </Section>
  );
}
