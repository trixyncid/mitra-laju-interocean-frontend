"use client"

import { ExportPaidDialog } from "@/app/dashboard/costings/export-paid-dialog"
import { ExportPph23Dialog } from "@/app/dashboard/costings/export-pph23-dialog"

export function CostingExportActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ExportPaidDialog />
      <ExportPph23Dialog />
    </div>
  )
}
