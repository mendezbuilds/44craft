"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToastAction } from "@/lib/use-toast-action";
import { changePasswordAction, type ChangePasswordState } from "@/lib/team-profile-actions";

const initialState: ChangePasswordState = {};

const fieldClasses =
  "w-full rounded-[6px] border border-[rgba(255,255,255,0.16)] bg-transparent px-4 py-2.5 text-sm text-ink " +
  "outline-none transition-[border-color,box-shadow] duration-200 " +
  "focus:border-gold focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useToastAction(changePasswordAction, initialState, {
    successMessage: "Password updated.",
  });

  return (
    <form action={formAction} className="grid max-w-[360px] gap-3">
      <label className="flex flex-col gap-1.5 text-sm text-ink-dim">
        New password
        <input type="password" name="password" required minLength={8} className={fieldClasses} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-ink-dim">
        Confirm new password
        <input type="password" name="confirmPassword" required minLength={8} className={fieldClasses} />
      </label>

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-gold">Password updated.</p>}

      <Button type="submit" variant="ghost" disabled={pending} className="justify-self-start gap-2">
        {pending && <Spinner />}
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
