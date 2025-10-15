
import { Header } from "@/components/header";
import { TablesClientContent } from "@/components/tables-client-content";

export default function TablesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <TablesClientContent />
    </div>
  );
}
