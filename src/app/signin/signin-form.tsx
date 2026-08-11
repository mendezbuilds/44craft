"use client";

import { useId } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FloatingField } from "@/components/ui/floating-field";
import { useToastAction } from "@/lib/use-toast-action";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = {};

export function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "";
  const [state, formAction, pending] = useToastAction(signInAction, initialState);
  const idPrefix = useId();

  return (
    <form action={formAction} className="grid w-full max-w-sm gap-y-8">
      <h1 className="font-display text-xl font-bold text-ink">Sign in</h1>

      <input type="hidden" name="redirectTo" value={redirectTo} />

      <FloatingField id={`${idPrefix}-email`} name="email" label="Email" type="email" autoComplete="email" />
      <FloatingField
        id={`${idPrefix}-password`}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={pending} className="justify-self-start gap-2">
        {pending && <Spinner />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
