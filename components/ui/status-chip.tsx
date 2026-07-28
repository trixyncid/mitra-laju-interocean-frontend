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
  status: "ONGOING" | "COMPLETED" | string
  className?: string
}) {
  const ongoing = status === "ONGOING"
  return (
    <span className={cn(ongoing ? chipActive() : chipInfo(), className)}>
      <Dot
        className={cn(
          "-ml-1 size-4",
          ongoing
            ? "text-[var(--mli-on-success-container)]"
            : "text-secondary-foreground"
        )}
      />
      {ongoing ? "Ongoing" : "Completed"}
    </span>
  )
}
