import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { InviteForm } from "./invite-form";
import { RevokeInviteButton } from "./revoke-invite-button";

function inviteStatus(invite: { usedAt: Date | null; revokedAt: Date | null; expiresAt: Date }) {
  if (invite.usedAt) return { label: "active", tone: "positive" as const };
  if (invite.revokedAt) return { label: "revoked", tone: "negative" as const };
  if (invite.expiresAt < new Date()) return { label: "expired", tone: "neutral" as const };
  return { label: "invited", tone: "warning" as const };
}

export default async function InvitesPage() {
  const invites = await prisma.invite.findMany({ orderBy: { createdAt: "desc" } });

  const users = await prisma.user.findMany({
    where: { email: { in: invites.map((i) => i.email) } },
    include: { teamProfile: { select: { name: true } } },
  });
  const nameByEmail = new Map(users.map((u) => [u.email, u.teamProfile?.name]));

  return (
    <Reveal onMount className="flex flex-col gap-8">
      <RevealItem>
        <h1 className="mb-6 font-display text-xl font-bold text-ink">Invites</h1>
        <InviteForm />
      </RevealItem>

      {invites.length === 0 ? (
        <RevealItem>
          <p className="text-sm text-ink-dim">No invites sent yet.</p>
        </RevealItem>
      ) : (
        <RevealItem>
          {/* Table on wider screens — below 640px it can't fit six columns
              without either overflow-scrolling (worse UX than the mobile
              app's usual card-based reflow) or squeezing text illegible,
              so mobile gets a stacked card list instead, matching how
              /dashboard reflows (cards/lists, no tables at all). */}
          <table className="hidden w-full border-collapse text-sm min-[640px]:table">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-left text-ink-dim">
                <th className="py-2 pr-4 font-normal">Name</th>
                <th className="py-2 pr-4 font-normal">Email</th>
                <th className="py-2 pr-4 font-normal">Role</th>
                <th className="py-2 pr-4 font-normal">Status</th>
                <th className="py-2 pr-4 font-normal">Sent</th>
                <th className="py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => {
                const status = inviteStatus(invite);
                const canRevoke = !invite.usedAt && !invite.revokedAt;
                return (
                  <tr key={invite.id} className="border-b border-[rgba(255,255,255,0.06)]">
                    <td className="py-3 pr-4 text-ink">{nameByEmail.get(invite.email) ?? "—"}</td>
                    <td className="py-3 pr-4 text-ink-dim">{invite.email}</td>
                    <td className="py-3 pr-4 text-ink-dim capitalize">{invite.role}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge label={status.label} tone={status.tone} />
                    </td>
                    <td className="py-3 pr-4 text-ink-dim">
                      {invite.createdAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3">{canRevoke && <RevokeInviteButton inviteId={invite.id} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ul className="flex flex-col gap-3 min-[640px]:hidden">
            {invites.map((invite) => {
              const status = inviteStatus(invite);
              const canRevoke = !invite.usedAt && !invite.revokedAt;
              return (
                <li key={invite.id}>
                  <AdminPanel className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-sm font-bold text-ink">
                          {nameByEmail.get(invite.email) ?? "—"}
                        </p>
                        <p className="truncate text-sm text-ink-dim">{invite.email}</p>
                      </div>
                      <StatusBadge label={status.label} tone={status.tone} />
                    </div>
                    <div className="mb-3 flex items-center gap-3 text-xs text-ink-dim">
                      <span className="capitalize">{invite.role}</span>
                      <span>·</span>
                      <span>
                        {invite.createdAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {canRevoke && <RevokeInviteButton inviteId={invite.id} />}
                  </AdminPanel>
                </li>
              );
            })}
          </ul>
        </RevealItem>
      )}
    </Reveal>
  );
}
