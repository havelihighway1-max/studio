import { Header } from "@/components/header";
import { GroClientContent } from "@/components/gro/gro-client-content";

export default function GroPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <GroClientContent />
      </main>
    </div>
  );
}