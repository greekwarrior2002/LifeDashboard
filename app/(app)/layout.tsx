import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { MobileDrawer, MobileNavProvider } from "@/components/mobile-drawer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileNavProvider>
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <MobileDrawer />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-3 pb-24 pt-4 sm:px-5 sm:py-5 lg:px-8 lg:pb-7 lg:pt-7">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </MobileNavProvider>
  );
}
