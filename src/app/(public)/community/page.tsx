import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { getPublishedTeamProfiles } from "@/lib/team-profile";
import { prisma } from "@/lib/prisma";

const DESCRIPTION = "44Craft's community and partnerships — updates, official partners, and how to get involved.";

export const metadata: Metadata = {
  title: "Community",
  description: DESCRIPTION,
  openGraph: { title: "Community — 44Craft", description: DESCRIPTION },
};

const PARTNERS = [
  {
    name: "Chronara AI Africa",
    // Partnership framing only — matching the "official, long-term, not a
    // one-off collaboration" language from SPEC.md Section 1's brand-voice
    // notes. No specifics about what Chronara actually does/ships:
    // inventing that would be exactly the "no fake numbers, no drift from
    // real brand voice" thing this project has been explicit about
    // avoiding everywhere else. Real per-partner copy is a content gap to
    // fill in later, not something to guess at now.
    blurb: "An official, long-term partnership — aligned for the long term, not a short-term collaboration.",
  },
  {
    name: "Starmark",
    blurb: "An official, long-term partnership — aligned for the long term, not a short-term collaboration.",
  },
];

export default async function CommunityPage() {
  const [teamProfiles, updates] = await Promise.all([
    getPublishedTeamProfiles(),
    prisma.communityUpdate.findMany({ orderBy: { date: "desc" } }),
  ]);

  return (
    <Section className="py-24 min-[901px]:py-32">
      <Reveal onMount className="flex flex-col gap-20">
        {/* Vision — same copy as the homepage About section (component-shared
            wasn't practical given About's layout is hero-specific parallax/
            watermark treatment this page doesn't use, so the actual
            sentences are copied verbatim instead of drifting into new
            marketing copy). */}
        <div>
          <RevealItem className="mb-5 flex items-center gap-[10px] font-mono text-xs uppercase tracking-[3px] text-ink-dim">
            <DiamondMark size={6} glow={false} />
            Community
          </RevealItem>
          <RevealItem>
            <h1 className="mb-8 max-w-[700px] text-[clamp(32px,5vw,52px)] leading-[1.1] font-display font-bold tracking-[-1px] text-ink">
              Infrastructure, not narratives.
            </h1>
          </RevealItem>
          <RevealItem className="max-w-[620px]">
            <p className="mb-6 text-[19px] leading-[1.7] text-ink-dim">
              44Craft is two things at once: a craft-driven agency delivering real client work — web3,
              marketing, social media management, and more — and a growing community for self-made
              builders. Craftsmen figuring it out with no handouts.
            </p>
            <p className="text-[19px] leading-[1.7] text-ink-dim">
              We&apos;re building toward a large African tech community — welcoming people from web2
              into web3, a place to explore, grind, and win together. Aligned for the long term, not a
              short-term collaboration.
            </p>
          </RevealItem>
        </div>

        {/* Real, honestly-scaled stats — no invented numbers. The X figure
            is a known real count (SPEC.md Section 1); the team count is
            computed live from actually-published profiles, not typed in. */}
        <RevealItem>
          <div className="grid grid-cols-2 gap-4 min-[601px]:grid-cols-3">
            <Card className="text-center">
              <p className="font-display text-3xl font-bold text-ink">~455</p>
              <p className="mt-1 text-sm text-ink-dim">Followers on X</p>
            </Card>
            <Card className="text-center">
              <p className="font-display text-3xl font-bold text-ink">{teamProfiles.length}</p>
              <p className="mt-1 text-sm text-ink-dim">Craftsmen on the team</p>
            </Card>
            <Card className="col-span-2 text-center min-[601px]:col-span-1">
              <p className="font-display text-3xl font-bold text-ink">Africa</p>
              <p className="mt-1 text-sm text-ink-dim">Where we&apos;re based</p>
            </Card>
          </div>
        </RevealItem>

        {/* Partners */}
        <div>
          <RevealItem>
            <h2 className="mb-6 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Partners</h2>
          </RevealItem>
          <div className="grid gap-5 min-[601px]:grid-cols-2">
            {PARTNERS.map((partner) => (
              <RevealItem key={partner.name}>
                <Card hover className="h-full">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(212,175,55,0.3)]">
                    <DiamondMark size={12} glow={false} />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-ink">{partner.name}</h3>
                  <p className="text-sm leading-[1.6] text-ink-dim">{partner.blurb}</p>
                </Card>
              </RevealItem>
            ))}
          </div>
        </div>

        {/* Join CTA — Discord is real as of Phase 9's launch audit (was
            "#" pending SPEC.md Section 13). Telegram still isn't, so the
            copy only promises what's actually live. */}
        <RevealItem>
          <Card className="flex flex-col items-center gap-4 py-14 text-center">
            <h2 className="font-display text-2xl font-bold text-ink">Come build with us.</h2>
            <p className="max-w-[420px] text-sm text-ink-dim">
              Join the Discord — that&apos;s where the community actually happens.
            </p>
            <a
              href="https://discord.gg/VHhgUHd5N9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[6px] border border-[rgba(212,175,55,0.45)] bg-black/25 px-5 py-[10px] font-body text-[13.5px] font-medium text-ink transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              Join the community
            </a>
          </Card>
        </RevealItem>

        {/* Updates feed */}
        <div>
          <RevealItem>
            <h2 className="mb-6 font-mono text-xs tracking-[3px] text-ink-dim uppercase">Updates</h2>
          </RevealItem>
          {updates.length > 0 ? (
            <div className="grid gap-5 min-[601px]:grid-cols-2 min-[1024px]:grid-cols-3">
              {updates.map((update) => (
                <RevealItem key={update.id}>
                  <Card className="flex h-full flex-col overflow-hidden p-0">
                    {update.image && (
                      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-[#1a170f]">
                        <Image src={update.image} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-6">
                      <p className="font-mono text-xs text-ink-dim">
                        {update.date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      <h3 className="font-display text-base font-bold text-ink">{update.title}</h3>
                      <p className="line-clamp-3 text-sm leading-[1.6] text-ink-dim">{update.body}</p>
                    </div>
                  </Card>
                </RevealItem>
              ))}
            </div>
          ) : (
            <RevealItem className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#141310] px-8 py-14 text-center">
              <p className="font-display text-lg font-bold text-ink">Nothing posted yet.</p>
              <p className="mx-auto mt-2 max-w-[420px] text-sm text-ink-dim">
                Real updates land here as things actually happen — not before.
              </p>
            </RevealItem>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
