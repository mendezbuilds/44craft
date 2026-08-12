import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { AvatarStack } from "@/components/avatar-stack";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { services, teamMembersForService, projectsForService } from "@/lib/data/services";
import { getPublishedTeamProfiles } from "@/lib/team-profile";
import { getAllProjects } from "@/lib/projects";

/**
 * Reads from the same static services array the /services index and
 * ServiceCard already use — not the (empty, currently disconnected)
 * Service Prisma table the admin CRUD manages. See SPEC.md Section 6 for
 * the full note on that gap; short version: the index already links here
 * using these slugs, and there's no real admin-entered data yet to switch
 * to without breaking those links. Flagged, not silently worked around.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  return { title: service ? `${service.title} — 44Craft` : "Service — 44Craft" };
}

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const [teamProfiles, allProjects] = await Promise.all([getPublishedTeamProfiles(), getAllProjects()]);
  const matchingMembers = teamMembersForService(service.slug, teamProfiles);
  const relatedProjects = projectsForService(service, allProjects);

  return (
    <Section className="py-24 min-[901px]:py-32">
      <Reveal onMount className="flex flex-col gap-12">
        <RevealItem>
          <Link href="/services" className="mb-6 inline-block text-sm text-ink-dim hover:text-ink">
            ← All services
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-[#1a1917]">
              <Image src={service.icon} alt="" width={28} height={28} className="opacity-80" />
            </div>
            <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
              {service.title}
            </h1>
          </div>
        </RevealItem>

        <div className="grid gap-10 min-[901px]:grid-cols-[1fr_280px] min-[901px]:gap-16">
          <div className="flex flex-col gap-10">
            <RevealItem>
              <p className="max-w-[620px] text-[17px] leading-[1.7] text-ink-dim">{service.fullDescription}</p>
            </RevealItem>

            {service.deliverables.length > 0 && (
              <RevealItem>
                <h2 className="mb-3 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Deliverables</h2>
                <ul className="flex flex-col gap-2">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex items-baseline gap-2.5 text-[15px] text-ink-dim">
                      <span className="text-gold">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </RevealItem>
            )}

            <RevealItem>
              <h2 className="mb-4 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Related projects</h2>
              {relatedProjects.length > 0 ? (
                <div className="grid gap-5 min-[601px]:grid-cols-2">
                  {relatedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        slug: project.slug,
                        title: project.title,
                        coverImage: project.coverImage,
                        tags: project.tags,
                        teamMembers: project.teamMembers,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-dim">Nothing tagged under this service yet.</p>
              )}
            </RevealItem>
          </div>

          <RevealItem>
            <h2 className="mb-3 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Who you&apos;d work with</h2>
            {matchingMembers.length > 0 ? (
              <AvatarStack
                members={matchingMembers.map((m) => ({ slug: m.slug, name: m.name, photo: m.photo }))}
                size="lg"
              />
            ) : (
              <p className="text-sm text-ink-dim">Team assignments coming soon.</p>
            )}
          </RevealItem>
        </div>
      </Reveal>
    </Section>
  );
}
