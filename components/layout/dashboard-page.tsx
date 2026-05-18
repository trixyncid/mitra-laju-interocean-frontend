import { cn } from "@/lib/utils"
import { pageCard, pageHeader, pageMain, pageShell } from "@/lib/design"

export function DashboardPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(pageShell, className)}>
      <main className={pageMain}>{children}</main>
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
  return <section className={cn(pageCard, className)}>{children}</section>
}
