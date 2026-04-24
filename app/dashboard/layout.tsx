"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

import { Providers } from "../providers";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { AudioLines } from "@/components/animate-ui/icons/audio-lines";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, isPending, error } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AudioLines animate="path-loop" speed={3} className="size-10 text-blue-500 animate-pulse"/>
        <p className="text-sm text-muted-foreground mt-4">Preparing your dashboard...</p>
      </div>
    )
  }

  if (error) return <div>Error: {error.message}</div>

  if (!session) return redirect("/")

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
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {children}
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
