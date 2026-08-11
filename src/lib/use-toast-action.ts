"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";

type BaseState = { error?: string };

/**
 * Wraps useActionState with the site-wide toast system — every admin/
 * dashboard/contact action was either silent on success or surfaced
 * errors only inline (or not at all). This fires a toast on both
 * outcomes without changing how each form already reads `state` for its
 * own inline error text, so existing inline messages stay put.
 *
 * `successMessage` can be a fixed string, or a function reading the
 * resolved state (for actions like sendInviteAction whose success text
 * already includes the recipient's email).
 *
 * The `lastHandled` ref (seeded with the initial state's own reference)
 * is what stops this from toasting on mount: useActionState only ever
 * returns a new object reference after a real submission resolves, so
 * the effect is a no-op until that happens.
 */
export function useToastAction<S extends BaseState>(
  action: (prevState: S, formData: FormData) => Promise<S>,
  initialState: S,
  options?: { successMessage?: string | ((state: S) => string | undefined) },
) {
  const { push } = useToast();
  // Explicit type args, and a cast on initialState — React types
  // useActionState's state as `Awaited<S>` throughout (accounting for
  // actions that could return a state wrapped in a Promise); every state
  // type used with this hook is a plain object, never a Promise, so
  // `Awaited<S>` and `S` are the same shape, but TS won't reduce that for
  // an unresolved generic on its own.
  const [state, formAction, pending] = useActionState<S, FormData>(action, initialState as Awaited<S>);
  const lastHandled = useRef(initialState);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;

    if (state.error) {
      push({ type: "error", message: state.error });
      return;
    }
    const message =
      typeof options?.successMessage === "function" ? options.successMessage(state) : options?.successMessage;
    if (message) push({ type: "success", message });
    // Only `state` and `push` should retrigger this — `options` is a fresh
    // object/closure every render and isn't meant to be a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, push]);

  return [state, formAction, pending] as const;
}
