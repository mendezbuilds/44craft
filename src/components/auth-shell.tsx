import Link from "next/link";
import Image from "next/image";
import { ConstellationBackground } from "@/components/constellation-background";

/**
 * Design-correction pass: sign-in (and accept-invite) previously had none
 * of the brand treatment — plain canvas, no constellation texture, no
 * logo, unstyled fields. Per the client-requested escalation ("no more
 * separate admin register"), the entry point to the whole authenticated
 * experience now matches the homepage: same dark canvas + constellation
 * texture, same real logo lockup linking back to `/`.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <ConstellationBackground className="fixed" />
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 py-16">
        <Link href="/" className="mb-10">
          <Image src="/brand/logo-wordmark.png" alt="44Craft" width={864} height={277} className="h-7 w-auto" priority />
        </Link>
        {children}
      </div>
    </div>
  );
}
