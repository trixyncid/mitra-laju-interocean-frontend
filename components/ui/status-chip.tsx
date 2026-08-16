import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"
import { chipActive, chipInactive, chipInfo, chipTbd, chipWarning } from "@/lib/design"

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
          active
            ? "text-[var(--mli-on-success-container)]"
            : "text-[var(--mli-on-error-container)]"
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
    <span className={cn(paid ? chipActive() : chipInactive(), className)}>
      <Dot
        className={cn(
          "-ml-1 size-4",
          paid
            ? "text-[var(--mli-on-success-container)]"
            : "text-[var(--mli-on-error-container)]"
        )}
      />
      {paid ? "Paid" : "Unpaid"}
    </span>
  )
}

export function UnlinkedChip({ className }: { className?: string }) {
  return <span className={chipInactive(className)}>Unlinked</span>
}

export function ShipmentLifecycleChip({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const normalized = (status ?? "").toUpperCase()
  const styles =
    normalized === "ONGOING"
      ? {
          chip: chipActive(),
          dot: "text-[var(--mli-on-success-container)]",
        }
      : normalized === "FINISHED"
        ? {
            chip: chipInfo(),
            dot: "text-secondary-foreground",
          }
        : normalized === "BACKUP"
          ? {
              chip: chipWarning(),
              dot: "text-[var(--mli-on-warning-container)]",
            }
          : {
              chip: chipTbd(),
              dot: "text-primary",
            }

  const label =
    normalized === "ONGOING"
      ? "Ongoing"
      : normalized === "FINISHED"
        ? "Finished"
        : normalized === "BACKUP"
          ? "Backup"
          : normalized === "DRAFT"
            ? "Draft"
            : formatFallback(status)

  return (
    <span className={cn(styles.chip, className)}>
      <Dot className={cn("-ml-1 size-4", styles.dot)} />
      {label}
    </span>
  )
}

function formatFallback(status: string) {
  if (!status) return "—"
  return status.charAt(0) + status.slice(1).toLowerCase()
}
