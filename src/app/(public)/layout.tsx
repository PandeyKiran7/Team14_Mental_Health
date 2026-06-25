import PublicRouteGuard from "@/components/layout/PublicRouteGuard";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1">
        <PublicRouteGuard>{children}</PublicRouteGuard>
      </main>
      <SiteFooter />
    </div>
  );
}
