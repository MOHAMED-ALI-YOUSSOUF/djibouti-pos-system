import Navbar from "@/components/layout/Navbar";
import OfflineIndicator from "@/components/common/OfflineIndicator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 p-4">{children}</main>
      <OfflineIndicator />
    </div>
  );
}