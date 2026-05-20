"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "../providers";
import { useRequireAuth } from "@/hooks/use-auth-redirect";
import { AudioLines } from "@/components/animate-ui/icons/audio-lines";
import { DashboardRouteGuard } from "@/components/dashboard-route-guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, isPending, error, isRedirecting } = useRequireAuth()

  if (isPending || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AudioLines animate="path-loop" speed={3} className="size-10 text-ring animate-pulse"/>
        <p className="mt-4 text-sm text-muted-foreground">Preparing your dashboard...</p>
      </div>
    )
  }

  if (error) return <div>Error: {error.message}</div>

  if (!session) return null

  return (
    <>
      <Providers>
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
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col">
                    <DashboardRouteGuard>{children}</DashboardRouteGuard>
                    <Toaster 
                        richColors
                        position="top-center"
                        theme="light"
                    />
                  </div>
                </div>
              </div>
            </SidebarInset>
        </SidebarProvider>
      </Providers>
    </>
  );
}
