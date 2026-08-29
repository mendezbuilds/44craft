"use client";

import { useId } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { DiamondMark } from "@/components/icons/diamond-mark";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FloatingField } from "@/components/ui/floating-field";
import { Reveal } from "@/components/motion/reveal";
import { RevealItem } from "@/components/motion/reveal-item";
import { floatLoop, riseInItem } from "@/lib/motion";
import { useToastAction } from "@/lib/use-toast-action";
import { sendContactAction, type ContactState } from "@/lib/contact-actions";

const initialState: ContactState = {};

// The select's focus sweep below is the one bit of this pattern
// FloatingField doesn't cover (it's not a floating-label field) — kept
// local since it's a one-off here.
const focusSweepClasses =
  "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold " +
  "transition-transform duration-300 ease-out peer-focus:scale-x-100";

/**
 * Quiet echo of the hero's gem — same real asset (public/brand/logo-mark.png),
 * shrunk down and floating (reuses lib/motion's floatLoop, the same
 * continuous-loop primitive the hero uses), with a soft radial glow and a
 * few constellation-style connector lines for texture. Gives the panel a
 * real focal point instead of loose shard fragments scattered in empty
 * space — replaced the earlier drifting-shards version for exactly that
 * reason.
 */
function ContactVisual() {
  return (
    <div
      className="relative hidden min-h-[420px] items-center justify-center min-[901px]:flex"
      aria-hidden="true"
    >
      <div className="absolute h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,transparent_70%)] blur-[20px]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 420">
        <g stroke="rgba(212,175,55,0.18)" strokeWidth={1}>
          <line x1="70" y1="90" x2="150" y2="150" />
          <line x1="330" y1="70" x2="255" y2="145" />
          <line x1="300" y1="350" x2="240" y2="280" />
          <line x1="90" y1="320" x2="160" y2="270" />
        </g>
        <g fill="rgba(212,175,55,0.4)">
          <circle cx="70" cy="90" r="2.5" />
          <circle cx="330" cy="70" r="2.5" />
          <circle cx="300" cy="350" r="2.5" />
          <circle cx="90" cy="320" r="2.5" />
        </g>
      </svg>

      <motion.div animate={floatLoop} className="relative w-[180px]">
        <Image
          src="/brand/logo-mark.png"
          alt=""
          width={646}
          height={520}
          className="h-auto w-full drop-shadow-[0_0_36px_rgba(212,175,55,0.22)]"
        />
      </motion.div>
    </div>
  );
}

/**
 * Homepage-only section (id="contact") — the standalone /contact route was
 * folded back into this in the Phase 3 consolidation pass. Inline success
 * state on submit, no redirect (SPEC.md Section 6). Also toasts on both
 * outcomes — the inline swap is the persistent confirmation, the toast is
 * the immediate one, same pattern used admin-wide now.
 */
export function ContactSection() {
  const [state, formAction, pending] = useToastAction(sendContactAction, initialState, {
    successMessage: "Message sent — we'll get back to you soon.",
  });
  const idPrefix = useId();

  return (
    <Section id="contact" className="py-24 min-[901px]:py-32">
      <Reveal className="grid gap-12 min-[901px]:grid-cols-2 min-[901px]:gap-10">
        <div>
          <RevealItem className="mb-5 flex items-center gap-[10px] font-mono text-xs uppercase tracking-[3px] text-ink-dim">
            <DiamondMark size={6} glow={false} />
            Contact
          </RevealItem>

          <motion.h2
            variants={riseInItem}
            className="mb-4 max-w-[560px] text-[clamp(28px,4vw,40px)] leading-[1.15] font-display font-bold tracking-[-1px] text-ink"
          >
            Start a project.
          </motion.h2>

          {/* Direct email, alongside the form rather than instead of it —
              stays visible through the success state too (unlike the
              form/success swap below), it's independent contact info, not
              part of that flow. Keep in sync with EMAIL_FROM
              (lib/resend.ts) if the domain ever changes — not imported
              directly since that module also holds the Resend client
              instantiated with the secret API key, unsafe to pull into a
              client component. */}
          <RevealItem className="mb-10 text-sm text-ink-dim">
            Or email us directly at{" "}
            <a
              href="mailto:hello@44craft.com"
              className="text-ink underline decoration-[rgba(255,255,255,0.24)] underline-offset-4 hover:text-gold"
            >
              hello@44craft.com
            </a>
          </RevealItem>

          <AnimatePresence mode="wait">
            {state.success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex max-w-[480px] items-center gap-3 rounded-[6px] border border-[rgba(255,255,255,0.14)] bg-black/25 px-5 py-4"
              >
                <Image src="/icons/check-diamond.svg" alt="" width={28} height={28} className="shrink-0" />
                <p className="text-sm text-ink">
                  Message sent. We&apos;ll get back to you soon.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                action={formAction}
                exit={{ opacity: 0 }}
                className="grid max-w-[480px] gap-y-8"
              >
                <div className="grid grid-cols-2 gap-x-5">
                  <RevealItem>
                    <FloatingField id={`${idPrefix}-name`} name="name" label="Name" />
                  </RevealItem>
                  <RevealItem>
                    <FloatingField id={`${idPrefix}-email`} name="email" label="Email" type="email" />
                  </RevealItem>
                </div>

                <RevealItem className="relative">
                  <select
                    name="projectType"
                    defaultValue=""
                    className="peer w-full appearance-none border-b border-[rgba(255,255,255,0.16)] bg-transparent pt-3 pb-2 text-base text-ink outline-none transition-colors duration-200"
                  >
                    <option value="" className="bg-[#141310]">
                      Project type (optional)
                    </option>
                    <option value="web3-development" className="bg-[#141310]">
                      Web3 Development
                    </option>
                    <option value="marketing" className="bg-[#141310]">
                      Marketing
                    </option>
                    <option value="social-media-management" className="bg-[#141310]">
                      Social Media Management
                    </option>
                    <option value="community-building" className="bg-[#141310]">
                      Community Building
                    </option>
                    <option value="other" className="bg-[#141310]">
                      Other
                    </option>
                  </select>
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 right-1 h-3 w-3 text-ink-dim"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 4l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span aria-hidden="true" className={focusSweepClasses} />
                </RevealItem>

                <RevealItem>
                  <FloatingField id={`${idPrefix}-message`} name="message" label="Message" textarea rows={4} />
                </RevealItem>

                {state.error && (
                  <RevealItem className="text-sm text-red-400" role="alert">
                    {state.error}
                  </RevealItem>
                )}

                <RevealItem>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={pending}
                    className="inline-flex items-center gap-2"
                  >
                    {pending && <Spinner />}
                    {pending ? "Sending…" : "Send message"}
                  </Button>
                </RevealItem>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <ContactVisual />
      </Reveal>
    </Section>
  );
}
