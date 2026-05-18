import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"
import { chipActive, chipInactive, chipTbd, chipWarning } from "@/lib/design"

export function StatusChip({
  active,
  className,
}: {
  active: boolean
  className?: string
}) {
  return (
    <span className={cn(active ? chipActive() : chipInactive(), className)}>
      <Dot
        className={cn(
          "-ml-1 size-4",
          active ? "text-ring" : "text-destructive"
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  )
}

export function TbdChip({ className }: { className?: string }) {
  return <span className={chipTbd(className)}>TBD</span>
}

export function WarningChip({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <span className={chipWarning(className)}>{children}</span>
}

export function PaymentStatusChip({
  paid,
  className,
}: {
  paid: boolean
  className?: string
}) {
  return (
    <span className={cn(paid ? chipActive() : chipWarning(), className)}>
      <Dot className={cn("-ml-1 size-4", paid ? "text-ring" : "text-[var(--mli-on-warning-container)]")} />
      {paid ? "Paid" : "Unpaid"}
    </span>
  )
}

export function UnlinkedChip({ className }: { className?: string }) {
  return <span className={chipInactive(className)}>Unlinked</span>
}
