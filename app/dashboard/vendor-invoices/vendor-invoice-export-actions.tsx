"use client"

import { ExportPaidDialog } from "@/app/dashboard/vendor-invoices/export-paid-dialog"
import { ExportPph23Dialog } from "@/app/dashboard/vendor-invoices/export-pph23-dialog"
import { usePermissions } from "@/hooks/use-permissions"

export function VendorInvoiceExportActions() {
  const { can } = usePermissions()
  if (!can("VENDOR_INVOICE", "export")) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExportPaidDialog />
      <ExportPph23Dialog />
    </div>
  )
}
