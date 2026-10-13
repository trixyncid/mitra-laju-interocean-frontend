"use client"

import { useRouter } from "next/navigation"
import {
  IconArrowUpRight,
  IconCircleCheck,
  IconCopy,
  IconLayoutColumns,
  IconRotate,
  IconTrash,
} from "@tabler/icons-react"
import type { Row } from "@tanstack/react-table"
import { toast } from "sonner"

import type { VendorInvoice } from "@/app/dashboard/vendor-invoices/columns"
import { RowActions } from "@/components/row-actions/row-actions"
import { VendorInvoicePanel } from "@/components/vendor-invoices/vendor-invoice-panel"
import { usePermissions } from "@/hooks/use-permissions"
import { useDeleteVendorInvoice, useUpdateVendorInvoice } from "@/hooks/use-vendor-invoices"

export default function VendorInvoiceActionCell({ row }: { row: Pick<Row<VendorInvoice>, "original"> }) {
  const router = useRouter()
  const { canWrite } = usePermissions()
  const deleteVendorInvoice = useDeleteVendorInvoice()
  const updateInvoice = useUpdateVendorInvoice()

  const invoice = row.original
  const canEdit = canWrite("vendor-invoices")
  const paid = invoice.status === "PAID"
  const name = invoice.vendor?.vendorName
    ? `${invoice.vendorInvoiceNumber} · ${invoice.vendor.vendorName}`
    : invoice.vendorInvoiceNumber

  // Same rule as the panel: paying keeps an existing payment date, else today.
  const setPaid = (nextPaid: boolean) => {
    const today = new Date().toISOString().slice(0, 10)
    updateInvoice.mutate(
      {
        id: invoice.id,
        vendorInvoice: {
          status: nextPaid ? "PAID" : "UNPAID",
          paymentDate: nextPaid ? invoice.paymentDate?.slice(0, 10) || today : null,
        },
      },
      {
        onSuccess: () => toast.success(nextPaid ? "Marked as paid" : "Marked as unpaid"),
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  return (
    <RowActions
      name={name}
      quickLook={(close) => (
        <VendorInvoicePanel vendorInvoiceId={invoice.id} onClose={close} onDeleted={close} className="h-full" />
      )}
      menu={[
        [
          { label: "Open full page", icon: <IconArrowUpRight />, href: `/dashboard/vendor-invoices/${invoice.id}` },
          {
            label: "Open in split view",
            icon: <IconLayoutColumns />,
            onSelect: () => {
              router.push(`/dashboard/vendor-invoices?invoice=${invoice.id}`)
            },
          },
          { label: "Copy invoice number", icon: <IconCopy />, copy: invoice.vendorInvoiceNumber },
        ],
        [
          canEdit &&
            (paid
              ? {
                  label: "Mark as unpaid",
                  icon: <IconRotate />,
                  disabled: updateInvoice.isPending,
                  onSelect: () => setPaid(false),
                }
              : {
                  label: "Mark as paid",
                  icon: <IconCircleCheck />,
                  hint: invoice.paymentDate ? undefined : "Payment date: today",
                  disabled: updateInvoice.isPending,
                  onSelect: () => setPaid(true),
                }),
        ],
        [
          canEdit && {
            label: "Delete invoice",
            icon: <IconTrash />,
            tone: "danger",
            confirm: {
              title: "Delete vendor invoice?",
              description: `This permanently removes ${invoice.vendorInvoiceNumber} and all line items.`,
              onConfirm: () =>
                deleteVendorInvoice.mutateAsync(invoice.id).catch((error: Error) => {
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
