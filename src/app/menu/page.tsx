
import { Header } from "@/components/header";
import { MenuClientContent } from "@/components/menu-client-content";
import menuData from '@/lib/menu-data.json';

export default function MenuPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <MenuClientContent menu={menuData.menu} />
    </div>
  );
}
