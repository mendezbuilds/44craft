// One-time migration: the four real services previously lived only in a
// static array (src/lib/data/services.ts), completely disconnected from
// the Service table the admin CRUD manages. This seeds that table with the
// exact same content so nothing is lost in the switch — see SPEC.md
// Section 6's "Services" note for the full history. Safe to re-run: each
// service is upserted by slug, not blindly inserted, so running this
// again after someone has already edited a service through admin won't
// clobber their changes back to the original static content.
//
// Env vars come from Node's --env-file flag (see the npm script), not a
// dotenv import here — same reasoning as scripts/seed-admin.ts.
import { prisma } from "../src/lib/prisma";

const SERVICES = [
  {
    slug: "web3-development",
    title: "Web3 Development",
    icon: "/icons/web3-dev.svg",
    shortDescription: "Smart contracts, dApps, and the infrastructure behind them.",
    fullDescription:
      "We build the technical layer of web3 products — smart contracts, dApp frontends, wallet integrations, and the infrastructure that keeps it all running. Shipped code, not whitepapers.",
    deliverables: ["Smart contract development", "dApp frontend & wallet integration", "Infrastructure & deployment"],
  },
  {
    slug: "marketing",
    title: "Marketing",
    icon: "/icons/marketing.svg",
    shortDescription: "Positioning and campaigns for projects that need to be found.",
    fullDescription:
      "Marketing that's built around what you're actually shipping, not generic growth-hacking templates. Positioning, campaign strategy, and execution for teams that need to be found by the right people.",
    deliverables: ["Positioning & messaging", "Campaign strategy", "Launch execution"],
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    icon: "/icons/social-media.svg",
    shortDescription: "Consistent presence and content, run by people who actually post.",
    fullDescription:
      "Day-to-day management of your social presence — content, scheduling, community replies — run by people who understand the space, not a generic agency playbook.",
    deliverables: ["Content calendar & posting", "Community engagement", "Performance tracking"],
  },
  {
    slug: "community-building",
    title: "Community Building",
    icon: "/icons/community.svg",
    shortDescription: "Turning an audience into a community that shows up.",
    fullDescription:
      "We've built our own community from zero — we apply the same approach to yours: real engagement over vanity metrics, structure that scales without losing what made it work early on.",
    deliverables: ["Community strategy & structure", "Moderation & engagement", "Growth planning"],
  },
];

async function main() {
  for (const service of SERVICES) {
    const result = await prisma.service.upsert({
      where: { slug: service.slug },
      create: service,
      update: {}, // already exists (either from a previous run, or an admin edit) — leave it alone
    });
    console.log(`${result.title} (${result.slug}) — ok`);
  }
  console.log(`Done. ${SERVICES.length} services present in the database.`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
