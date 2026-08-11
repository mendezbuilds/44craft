"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error";
type ToastEntry = { id: number; tone: ToastTone; message: string };

type ToastContextValue = {
  push: (toast: { type: ToastTone; message: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

/**
 * One reusable toast system for the whole site (public + admin — both
 * live under the same true root layout, src/app/layout.tsx, so a single
 * provider there covers everything). Dark card + gold-tinted border, not
 * a generic green/red toast-library default, per the site-wide feedback
 * brief. Auto-dismisses after 5s, dismissible manually too.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ type, message }: { type: ToastTone; message: string }) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, tone: type, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  // document.body isn't available during SSR — same mount-detection
  // primitive used by the mobile nav portal (navbar.tsx).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 min-[601px]:items-end min-[601px]:bottom-4 min-[601px]:right-4 min-[601px]:left-auto"
            aria-live="polite"
          >
            <AnimatePresence>
              {toasts.map((toast) => (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  role="status"
                  className={cn(
                    "pointer-events-auto flex w-full max-w-[360px] items-start gap-3 rounded-[8px] border bg-[#141310]/95 px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-sm",
                    toast.tone === "success" ? "border-[rgba(212,175,55,0.35)]" : "border-red-500/35",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-[3px] h-2 w-2 shrink-0 rounded-full",
                      toast.tone === "success" ? "bg-gold" : "bg-red-400",
                    )}
                  />
                  <p className="flex-1 text-sm text-ink">{toast.message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    aria-label="Dismiss"
                    className="shrink-0 text-ink-dim transition-colors hover:text-ink"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
