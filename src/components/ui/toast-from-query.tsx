"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";

/**
 * Fires a success toast from a `?toast=<key>` query param, then strips
 * the param so refreshing/sharing the URL doesn't re-fire it. Needed
 * specifically for CRUD create/update flows: those redirect on success
 * (`redirect()` unmounts the submitting form before any state update
 * could reach it), so the toast has to be picked up on the page it lands
 * on instead of from the action's return value directly.
 */
export function ToastFromQuery({ messages, param = "toast" }: { messages: Record<string, string>; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const key = searchParams.get(param);
    if (!key) return;
    handled.current = true;

    const message = messages[key];
    if (message) push({ type: "success", message });

    const next = new URLSearchParams(searchParams);
    next.delete(param);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
    // Deliberately mount-only: re-running this on every searchParams
    // change would fight with the router.replace call above (it clears
    // the very param this effect reads).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
