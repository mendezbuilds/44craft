"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FloatingField } from "@/components/ui/floating-field";
import { useToastAction } from "@/lib/use-toast-action";
import { acceptInviteAction, type AcceptInviteState } from "./actions";

const initialState: AcceptInviteState = {};

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, pending] = useToastAction(acceptInviteAction, initialState);
  const idPrefix = useId();

  return (
    <form action={formAction} className="grid w-full max-w-sm gap-y-8">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-dim">Setting up account for {email}</p>
      </div>

      <input type="hidden" name="token" value={token} />

      <FloatingField
        id={`${idPrefix}-password`}
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />
      <FloatingField
        id={`${idPrefix}-confirm`}
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        minLength={8}
      />

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="justify-self-start gap-2">
        {pending && <Spinner />}
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
