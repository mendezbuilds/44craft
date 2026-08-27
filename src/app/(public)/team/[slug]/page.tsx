import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { TeamPhoto } from "@/components/team-photo";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { SOCIAL_ICONS } from "@/components/icons/social-icons";
import { getPublishedTeamProfileBySlug } from "@/lib/team-profile";
import { servicesForSkills, getAllServices } from "@/lib/services";
import { getCurrentUser } from "@/lib/auth";
import { initials } from "@/lib/initials";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import type { Socials } from "@/lib/team-profile";

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

const SOCIAL_LABELS: Record<keyof Socials, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X",
  website: "Website",
};

/**
 * A project cover thumbnail linking to /projects/[slug] — deliberately
 * not the full ProjectCard (that one needs tags + AvatarStack data this
 * page never fetches, and would show other credited members on what's
 * supposed to read as *this person's* portfolio entry, which is
 * backwards here). Just image + title, sized to work whether there's
 * one entry or a dozen.
 */
function PortfolioCard({ project }: { project: { slug: string; title: string; coverImage: string | null } }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#1a170f] to-[#0a0a08] transition-colors duration-300 group-hover:border-[rgba(212,175,55,0.5)]">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-ink-dim/40">
            44CRAFT
          </div>
        )}
      </div>
      <p className="mt-2.5 text-sm font-medium text-ink transition-colors group-hover:text-gold">{project.title}</p>
    </Link>
  );
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
  const socials = profile.socials ?? {};
  const activeSocials = (Object.keys(SOCIAL_LABELS) as (keyof Socials)[]).filter((key) => socials[key]);
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

      {/* Portfolio-hero layout: photo + status label + socials in a
          narrow left column, name/role/bio as the dominant element on
          the right — same "circular photo, bold name, short punchy
          line, action row" energy as a personal portfolio hero, without
          borrowing anything that assumes a freelance "hire me" framing. */}
      <div className="grid gap-10 min-[901px]:grid-cols-[280px_1fr] min-[901px]:gap-16">
        <div className="flex flex-col items-center text-center min-[901px]:items-start min-[901px]:text-left">
          <div className="mb-5 flex items-center gap-2 font-mono text-xs tracking-[3px] text-ink-dim uppercase">
            <DiamondMark size={8} glow={false} />
            44Craft team
          </div>

          <div className="team-card-glow relative flex aspect-square w-full max-w-[240px] items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#1a170f] to-[#0a0a08]">
            {profile.photo ? (
              <TeamPhoto src={profile.photo} sizes="240px" />
            ) : (
              <span className="team-card-initials font-display font-extrabold">
                {initials(profile.name)}
              </span>
            )}
          </div>

          {activeSocials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {activeSocials.map((key) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={socials[key]}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={SOCIAL_LABELS[key]}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] text-ink-dim transition-colors duration-200 hover:border-[rgba(212,175,55,0.45)] hover:text-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h1 className="mb-2 text-[clamp(40px,6vw,72px)] leading-[0.98] font-display font-extrabold tracking-[-1.5px] text-ink">
            {profile.name}
          </h1>
          <p className="mb-6 text-xl font-medium text-gold">{profile.roleTitle}</p>

          {profile.bio && (
            <p className="mb-12 max-w-[560px] text-lg leading-[1.6] whitespace-pre-wrap text-ink-dim">{profile.bio}</p>
          )}

          <div className="mb-10">
            <h2 className="mb-4 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Featured work</h2>
            {profile.projects.length > 0 ? (
              <div className="grid grid-cols-2 gap-5 min-[601px]:grid-cols-3">
                {profile.projects.map((project) => (
                  <PortfolioCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[rgba(255,255,255,0.14)] px-5 py-8 text-center">
                <p className="text-sm text-ink-dim">
                  Nothing featured yet — projects show up here as they get credited.
                </p>
              </div>
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
