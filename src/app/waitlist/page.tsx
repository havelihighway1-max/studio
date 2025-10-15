
import { Header } from "@/components/header";
import { WaitlistClientContent } from "@/components/waitlist-client-content";

export default function WaitlistPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <WaitlistClientContent />
    </div>
  );
}
