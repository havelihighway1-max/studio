
import { Header } from "@/components/header";
import { ReportsClientContent } from "@/components/reports-client-content";

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background print:bg-white">
        <Header />
        <ReportsClientContent />
    </div>
  );
}
