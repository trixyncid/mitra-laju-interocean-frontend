"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

import { useRequireAuth } from "@/hooks/use-auth-redirect";
import { DashboardRouteGuard } from "@/components/dashboard-route-guard";
import ErrorPage from "@/components/error-page";
import DashboardPrepLoading from "@/components/loading/dashboard-prep-loading";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, isPending, error, isRedirecting } = useRequireAuth()

  if (isPending || isRedirecting) {
    return <DashboardPrepLoading />
  }

  if (error) return <ErrorPage message={error.message} />

  if (!session) return null

  return (
    <>
        <SidebarProvider
          style={
            {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
            <SiteHeader />
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="@container/main flex min-h-0 flex-1 flex-col">
                  <div className="flex min-h-0 flex-1 flex-col">
                    <DashboardRouteGuard>{children}</DashboardRouteGuard>
                  </div>
                </div>
              </div>
            </SidebarInset>
        </SidebarProvider>
    </>
  );
}
