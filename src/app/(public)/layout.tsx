import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ConstellationBackground } from "@/components/constellation-background";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col">
      <ConstellationBackground className="fixed" />
      <div className="relative z-[1] flex flex-1 flex-col">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
