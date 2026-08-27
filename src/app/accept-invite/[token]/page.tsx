import type { Metadata } from "next";
import { getValidInvite } from "@/lib/accept-invite";
import { AuthShell } from "@/components/auth-shell";
import { AcceptInviteForm } from "./accept-invite-form";

// Contains a real invite token in the URL — must never be indexed.
export const metadata: Metadata = {
  title: "Accept invite",
  robots: { index: false, follow: false },
};

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { invite, error } = await getValidInvite(token);

  return (
    <AuthShell>
      {invite ? (
        <div className="w-full max-w-sm">
          <AcceptInviteForm token={token} email={invite.email} />
        </div>
      ) : (
        <p className="max-w-sm rounded-[6px] border border-red-500/30 bg-black/25 px-5 py-4 text-sm text-red-400">
          {error}
        </p>
      )}
    </AuthShell>
  );
}
