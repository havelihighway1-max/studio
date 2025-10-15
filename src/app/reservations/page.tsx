
import { Header } from "@/components/header";
import { ReservationsClientContent } from "@/components/reservations-client-content";

export default function ReservationsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <ReservationsClientContent />
    </div>
  );
}
