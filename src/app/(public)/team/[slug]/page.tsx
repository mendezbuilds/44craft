import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { TeamPhoto } from "@/components/team-photo";
import { getPublishedTeamProfileBySlug } from "@/lib/team-profile";
import { servicesForSkills, getAllServices } from "@/lib/services";
import { getCurrentUser } from "@/lib/auth";
import { initials } from "@/lib/initials";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublishedTeamProfileBySlug(slug);
  if (!profile) return { title: "Team member" };

  const description = `${profile.name}, ${profile.roleTitle} at 44Craft.${profile.bio ? ` ${profile.bio}` : ""}`;
  return {
    title: profile.name,
    description,
    openGraph: {
      title: `${profile.name} — 44Craft`,
      description,
      images: profile.photo ? [{ url: profile.photo }] : DEFAULT_OG_IMAGE,
    },
  };
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublishedTeamProfileBySlug(slug);
  if (!profile) notFound();

  const user = await getCurrentUser();
  const isOwnProfile = user?.id === profile.userId;
  const allServices = await getAllServices();
  const coveredServices = servicesForSkills(profile.skills, allServices);

  return (
    <Section className="py-24 min-[901px]:py-32">
      {isOwnProfile && (
        <div className="mb-8 flex items-center justify-between rounded-[6px] border border-[rgba(212,175,55,0.3)] bg-black/25 px-5 py-3">
          <p className="text-sm text-ink-dim">This is your public profile.</p>
          <Button href="/dashboard/profile" variant="ghost">
            Edit profile
          </Button>
        </div>
      )}

      <div className="grid gap-10 min-[901px]:grid-cols-[280px_1fr] min-[901px]:gap-16">
        <div>
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#1a170f] to-[#0a0a08]">
            {profile.photo ? (
              <TeamPhoto src={profile.photo} sizes="280px" />
            ) : (
              <span className="team-card-initials font-display font-extrabold">
                {initials(profile.name)}
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="mb-1 text-[clamp(28px,4vw,40px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
            {profile.name}
          </h1>
          <p className="mb-6 text-lg text-ink-dim">{profile.roleTitle}</p>

          {profile.bio && <p className="mb-8 max-w-[620px] text-[17px] leading-[1.7] text-ink-dim">{profile.bio}</p>}

          <div className="mb-10">
            <h2 className="mb-3 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Featured work</h2>
            {profile.projects.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {profile.projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="text-sm text-ink underline decoration-[rgba(255,255,255,0.24)] underline-offset-4 hover:text-gold"
                    >
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-dim">Nothing featured yet.</p>
            )}
          </div>

          {coveredServices.length > 0 && (
            <div>
              <h2 className="mb-3 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Services covered</h2>
              <ul className="flex flex-col gap-2">
                {coveredServices.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-sm text-ink underline decoration-[rgba(255,255,255,0.24)] underline-offset-4 hover:text-gold"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
