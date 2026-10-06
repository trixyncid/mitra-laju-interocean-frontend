import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"
import { chipActive, chipBackup, chipDraft, chipFinished, chipInactive, chipTbd, chipWarning } from "@/lib/design"

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

export function SellingStatusChip({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const normalized = (status ?? "").toUpperCase()
  if (normalized === "DRAFT") {
    return (
      <span className={cn(chipDraft(), className)}>
        <Dot className="-ml-1 size-4 text-[var(--mli-on-draft-container)]" />
        Draft
      </span>
    )
  }
  return (
    <PaymentStatusChip paid={normalized === "PAID"} className={className} />
  )
}

export function UnlinkedChip({ className }: { className?: string }) {
  return <span className={chipInactive(className)}>Unlinked</span>
}

export function VendorInvoiceTypeChip({
  type,
  className,
}: {
  type?: string | null
  className?: string
}) {
  const isReimbursement = (type ?? "INVOICE").toUpperCase() === "REIMBURSEMENT"
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold leading-4 tracking-normal",
        isReimbursement
          ? "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]"
          : "bg-secondary text-primary",
        className
      )}
    >
      {isReimbursement ? "Reimbursement" : "Invoice"}
    </span>
  )
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
            chip: chipFinished(),
            dot: "text-[var(--mli-on-finished-container)]",
          }
        : normalized === "BACKUP"
          ? {
              chip: chipBackup(),
              dot: "text-[var(--mli-on-backup-container)]",
            }
          : {
              chip: chipDraft(),
              dot: "text-[var(--mli-on-draft-container)]",
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
