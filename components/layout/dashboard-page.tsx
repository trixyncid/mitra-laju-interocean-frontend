import { cn } from "@/lib/utils"
import { pageCard, pageHeader, pageMain, pageShell } from "@/lib/design"
import { DashboardAtmosphere } from "@/components/layout/dashboard-atmosphere"

export function DashboardPage({
  children,
  className,
  atmosphere = false,
}: {
  children: React.ReactNode
  className?: string
  atmosphere?: boolean
}) {
  return (
    <div
      className={cn(
        pageShell,
        atmosphere &&
          "relative isolate flex min-h-full flex-1 flex-col overflow-x-clip bg-transparent",
        className
      )}
    >
      {atmosphere ? <DashboardAtmosphere /> : null}
      <main className={cn(pageMain, atmosphere && "flex-1")}>{children}</main>
    </div>
  )
}

export function DashboardPageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn(pageHeader, className)}>
      <div className="min-w-0 flex-1 space-y-2">
        <h1 className="text-headline-lg">{title}</h1>
        {description ? (
          <p className="max-w-4xl text-pretty text-body-md text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </header>
  )
}

export function DashboardPageCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn(pageCard, "relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.65)] to-transparent"
      />
      <div className="relative">{children}</div>
    </section>
  )
}
