import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { EntryGem } from "@/components/motion/entry-gem";
import { SignInForm } from "./signin-form";

/**
 * The entry point to the whole authenticated experience — first thing an
 * admin/team member sees, and per the design-correction pass, the single
 * best place for the full assembling-gem moment outside the homepage hero
 * itself. Gated to first sign-in per browser (EntryGem) rather than
 * replaying every time someone signs back in during the day.
 */
export default function SignInPage() {
  return (
    <AuthShell>
      <EntryGem storageKey="signin-gem" size="w-40 min-[601px]:w-48" />
      <div className="mt-10 w-full max-w-sm">
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
