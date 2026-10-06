"use client"

import { costingSellingLineNet, localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Info } from "lucide-react"
import { SellingStatusChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconTrash } from "@tabler/icons-react"
import { useDeleteSelling } from "@/hooks/use-sellings"
import { toast } from "sonner"
import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { usePermissions } from "@/hooks/use-permissions"
import {
  actionColumn,
  dateSort,
  numberSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Selling = {
  id: string
  sellingNumber: string
  status: string
  invoiceDate?: string | null
  paymentDate?: string | null
  remarks?: string | null
  shipmentId: string
  customerId: string
  customer?: {
    id: string
    customerCode: string
    customerName: string
  } | null
  shipment?: {
    id: string
    orderNumber: string
    status?: string
  } | null
  costingBreakdowns?: Array<{
    id: string
    sellingAmount?: number | string | null
    sellingVatPercentage?: number | string | null
    sellingPph23Percentage?: number | string | null
  }>
  createdAt?: string
  updatedAt?: string
  updatedBy?: { name?: string } | string
}

function SellingActionCell({ row }: { row: Row<Selling> }) {
  const { canWrite } = usePermissions()
  const [open, setOpen] = useState(false)
  const deleteSelling = useDeleteSelling()

  if (!canWrite("sellings")) return null

  return (
    <div className="flex items-center gap-x-2">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (deleteSelling.isPending) return
          setOpen(next)
        }}
      >
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Delete invoice">
            <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete invoice</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Delete {row.original.sellingNumber}? Costing lines will become
            available to invoice again.
          </DialogDescription>
          <DialogFooter>
            <DeleteConfirmButton
              isPending={deleteSelling.isPending}
              onClick={() => {
                deleteSelling.mutate(row.original.id, {
                  onSuccess: () => setOpen(false),
                  onError: (error: Error) => toast.warning(error.message),
                })
              }}
            />
            <DialogClose asChild>
              <Button variant="secondary" disabled={deleteSelling.isPending}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const columns: ColumnDef<Selling>[] = [
  {
    accessorKey: "sellingNumber",
    header: ({ column }) => sortHeader(column, "Invoice #"),
    ...textSort,
    cell: ({ row }) => (
      <div className={`${primaryText} flex items-center gap-x-1`}>
        <Link
          href={`/dashboard/sellings/${row.original.id}`}
          className="hover:underline flex items-center gap-x-1"
        >
          {row.original.sellingNumber}{" "}
          <Info className="size-3.5 text-muted-foreground" />
        </Link>
      </div>
    ),
  },
  {
    id: "customer",
    accessorFn: (row) => row.customer?.customerName ?? "",
    header: ({ column }) => sortHeader(column, "Customer"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.customer?.customerName ?? "—"}
      </span>
    ),
  },
  {
    id: "shipment",
    accessorFn: (row) => row.shipment?.orderNumber ?? "",
    header: ({ column }) => sortHeader(column, "Shipment"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.shipment?.orderNumber ?? "—"}
      </span>
    ),
  },
  {
    id: "netAmount",
    accessorFn: (row) =>
      (row.costingBreakdowns ?? []).reduce(
        (sum, line) => sum + costingSellingLineNet(line),
        0
      ),
    header: ({ column }) => sortHeader(column, "Net amount (Rp)"),
    ...numberSort,
    cell: ({ row }) => (
      <p>
        {(row.original.costingBreakdowns ?? [])
          .reduce((sum, line) => sum + costingSellingLineNet(line), 0)
          .toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => sortHeader(column, "Status"),
    ...textSort,
    cell: ({ row }) => <SellingStatusChip status={row.original.status} />,
  },
  {
    accessorKey: "invoiceDate",
    header: ({ column }) => sortHeader(column, "Invoice date"),
    ...dateSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.invoiceDate
          ? localDate(row.original.invoiceDate)
          : "—"}
      </span>
    ),
  },
  {
    id: "updatedBy",
    accessorFn: (row) =>
      typeof row.updatedBy === "string"
        ? row.updatedBy
        : (row.updatedBy?.name ?? ""),
    header: ({ column }) => sortHeader(column, "Modified by"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {typeof row.original.updatedBy === "string"
          ? row.original.updatedBy
          : row.original.updatedBy?.name}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => sortHeader(column, "Modified at"),
    ...dateSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.updatedAt ? localDate(row.original.updatedAt) : "—"}
      </span>
    ),
  },
  {
    ...actionColumn,
    header: "Action",
    cell: ({ row }) => <SellingActionCell row={row} />,
  },
]
