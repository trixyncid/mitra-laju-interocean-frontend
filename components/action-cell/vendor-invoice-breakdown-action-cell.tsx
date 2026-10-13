"use client"

import { IconCalculator, IconCopy, IconFileInvoice, IconPencil, IconTrash } from "@tabler/icons-react"
import type { Row } from "@tanstack/react-table"
import { toast } from "sonner"

import VendorInvoiceBreakdownForm from "@/components/forms/vendor-invoice-breakdown-form"
import { RowActions } from "@/components/row-actions/row-actions"
import { Button } from "@/components/ui/button"
import { VendorInvoicePanel } from "@/components/vendor-invoices/vendor-invoice-panel"
import { useDeleteVendorInvoiceBreakdown } from "@/hooks/use-vendor-invoices"
import { usePermissions } from "@/hooks/use-permissions"
import type { VendorInvoiceBreakdownListItem } from "@/services/vendor-invoice.service"

export default function VendorInvoiceBreakdownActionCell({
  row,
}: {
  row: Pick<Row<VendorInvoiceBreakdownListItem>, "original">
}) {
  const { canWrite, canView } = usePermissions()
  const line = row.original
  const deleteBreakdown = useDeleteVendorInvoiceBreakdown(line.vendorInvoiceId)
  const canEdit = canWrite("vendor-invoices")
  const invoiceNumber = line.vendorInvoice.vendorInvoiceNumber
  const name = `${line.productDescription} · ${invoiceNumber}`

  return (
    <RowActions
      name={name}
      primary={
        canEdit ? (
          <VendorInvoiceBreakdownForm
            mode="edit"
            vendorInvoiceId={line.vendorInvoiceId}
            breakdown={line}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                title="Edit line"
                aria-label={`Edit ${line.productDescription}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <IconPencil className="size-4" />
              </Button>
            }
          />
        ) : null
      }
      quickLook={(close) => (
        <VendorInvoicePanel vendorInvoiceId={line.vendorInvoiceId} onClose={close} onDeleted={close} className="h-full" />
      )}
      menu={[
        [
          { label: "Open invoice", icon: <IconFileInvoice />, href: `/dashboard/vendor-invoices/${line.vendorInvoiceId}` },
          line.costing && canView("COSTING")
            ? {
                label: "Open costing",
                icon: <IconCalculator />,
                href: `/dashboard/costings?costing=${line.costing.id}`,
              }
            : null,
          { label: "Copy invoice number", icon: <IconCopy />, copy: invoiceNumber },
        ],
        [
          canEdit && {
            label: "Remove line",
            icon: <IconTrash />,
            tone: "danger",
            confirm: {
              title: "Remove this line?",
              description: `Remove “${line.productDescription}” from vendor invoice ${invoiceNumber}.`,
              onConfirm: () =>
                deleteBreakdown.mutateAsync(line.id).catch((error: Error) => {
                  toast.error(error.message)
                  throw error
                }),
            },
          },
        ],
      ]}
    />
  )
}
