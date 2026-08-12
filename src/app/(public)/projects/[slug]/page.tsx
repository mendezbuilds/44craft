import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { AvatarStack } from "@/components/avatar-stack";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { serviceForTag } from "@/lib/data/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return { title: project ? `${project.title} — 44Craft` : "Project — 44Craft" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  // Same order the index page renders in, so prev/next feels like moving
  // one step along the grid rather than an arbitrary jump.
  const all = await getAllProjects();
  const index = all.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  return (
    <Section className="py-24 min-[901px]:py-32">
      <Reveal onMount className="flex flex-col gap-10">
        <RevealItem>
          <Link href="/projects" className="text-sm text-ink-dim hover:text-ink">
            ← All projects
          </Link>
        </RevealItem>

        <RevealItem className="relative aspect-[21/9] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#1a170f] to-[#0a0a08]">
          {project.coverImage ? (
            <Image src={project.coverImage} alt="" fill sizes="100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-ink-dim/40">
              44CRAFT
            </div>
          )}
        </RevealItem>

        <div className="grid gap-10 min-[901px]:grid-cols-[1fr_280px] min-[901px]:gap-16">
          <div>
            <RevealItem>
              <h1 className="mb-4 text-[clamp(28px,4vw,44px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
                {project.title}
              </h1>
              <p className="max-w-[620px] text-[17px] leading-[1.7] text-ink-dim">{project.description}</p>
            </RevealItem>

            {project.tags.length > 0 && (
              <RevealItem className="mt-8 flex flex-wrap gap-2">
                {project.tags.map((tag) => {
                  const service = serviceForTag(tag);
                  return service ? (
                    <Link key={tag} href={`/services/${service.slug}`}>
                      <Tag className="transition-colors hover:border-[rgba(212,175,55,0.5)] hover:text-gold">{tag}</Tag>
                    </Link>
                  ) : (
                    <Tag key={tag}>{tag}</Tag>
                  );
                })}
              </RevealItem>
            )}
          </div>

          <div className="flex flex-col gap-8">
            {project.teamMembers.length > 0 && (
              <RevealItem>
                <h2 className="mb-3 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Built by</h2>
                <AvatarStack members={project.teamMembers} size="lg" />
              </RevealItem>
            )}

            {project.liveUrl && (
              <RevealItem>
                <Button href={project.liveUrl} target="_blank" rel="noreferrer noopener" variant="primary">
                  Visit live site
                </Button>
              </RevealItem>
            )}
          </div>
        </div>

        {(prev || next) && (
          <RevealItem className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-8">
            {prev ? (
              <Link href={`/projects/${prev.slug}`} className="group flex flex-col text-sm">
                <span className="text-ink-dim">← Previous</span>
                <span className="text-ink transition-colors group-hover:text-gold">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/projects/${next.slug}`} className="group flex flex-col text-right text-sm">
                <span className="text-ink-dim">Next →</span>
                <span className="text-ink transition-colors group-hover:text-gold">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </RevealItem>
        )}
      </Reveal>
    </Section>
  );
}
