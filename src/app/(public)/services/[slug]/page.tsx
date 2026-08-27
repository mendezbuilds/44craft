import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { AvatarStack } from "@/components/avatar-stack";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { getServiceBySlug, getAllServices, teamMembersForService, projectsForService } from "@/lib/services";
import { getPublishedTeamProfiles } from "@/lib/team-profile";
import { getAllProjects } from "@/lib/projects";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

/**
 * Now reads the real Service table (src/lib/services.ts) instead of the
 * static file that used to live at src/lib/data/services.ts — see
 * SPEC.md Section 6's "Services" note and scripts/migrate-services-to-db.ts
 * for the full history of that gap and how the content was carried over.
 *
 * No generateStaticParams here on purpose (unlike the version that first
 * shipped this page) — a service created or edited through admin needs to
 * show up without a rebuild/redeploy. This renders per-request instead,
 * the same way /projects/[slug] and /team/[slug] already do; admin's
 * service actions also call revalidatePath so an edit is reflected
 * immediately rather than only on next natural cache expiry.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service" };

  return {
    title: service.title,
    description: service.shortDescription,
    openGraph: {
      title: `${service.title} — 44Craft`,
      description: service.shortDescription,
      images: DEFAULT_OG_IMAGE,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [teamProfiles, allProjects, allServices] = await Promise.all([
    getPublishedTeamProfiles(),
    getAllProjects(),
    getAllServices(),
  ]);
  const matchingMembers = teamMembersForService(service.slug, teamProfiles);
  const relatedProjects = projectsForService(service, allProjects, allServices);

  return (
    <Section className="py-24 min-[901px]:py-32">
      <Reveal onMount className="flex flex-col gap-12">
        <RevealItem>
          <Link href="/services" className="mb-6 inline-block text-sm text-ink-dim hover:text-ink">
            ← All services
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-[#1a1917]">
              {service.icon && <Image src={service.icon} alt="" width={28} height={28} className="opacity-80" />}
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
