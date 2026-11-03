"use client"

import { SupportedByTrixync } from "@/components/brand/trixync-mark"
import { AppTopNav } from "@/components/layout/app-top-nav"
import { useRequireAuth } from "@/hooks/use-auth-redirect"
import { DashboardRouteGuard } from "@/components/dashboard-route-guard";
import DashboardPrepLoading from "@/components/loading/dashboard-prep-loading";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, isPending, isRedirecting } = useRequireAuth()

  if (isPending || isRedirecting) {
    return <DashboardPrepLoading />
  }

  if (!session) return null

  return (
    <div className="relative isolate flex min-h-svh flex-col">
      <div className="mli-canvas print:hidden" aria-hidden />
      {/* `contents` keeps the nav sticky; printouts leave the app chrome out. */}
      <div className="contents print:hidden">
        <AppTopNav />
      </div>
      <div className="@container/main flex min-h-0 flex-1 flex-col">
        <DashboardRouteGuard>{children}</DashboardRouteGuard>
      </div>
      <footer className="mx-auto flex print:hidden w-full max-w-[var(--mli-container-max)] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border/60 px-4 pt-4 pb-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} Mitra Laju Interocean</span>
        <SupportedByTrixync className="-mr-2.5" />
      </footer>
    </div>
  );
}
