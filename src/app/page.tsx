
import { Header } from "@/components/header";
import { DashboardClientContent } from "@/components/dashboard-client-content";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <DashboardClientContent />
    </div>
  );
}
