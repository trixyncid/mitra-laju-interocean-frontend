"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowUpRight, IconBriefcase, IconCopy, IconLayoutColumns, IconTrash } from "@tabler/icons-react"

import { CustomerInvoicePanel } from "@/components/customer-invoices/customer-invoice-panel"
import { InvoicePaymentButton } from "@/components/customer-invoices/invoice-actions"
import { RowActions } from "@/components/row-actions/row-actions"
import { useDeleteCustomerInvoice } from "@/hooks/use-customer-invoices"
import { usePermissions } from "@/hooks/use-permissions"
import type { CustomerInvoice } from "@/lib/types/customer-invoice"

/** Mark paid, quick look, open, copy and delete for one invoice in the table. */
export function InvoiceRowActions({ invoice }: { invoice: CustomerInvoice }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can, canView } = usePermissions()
  const remove = useDeleteCustomerInvoice()
  const paid = invoice.customerInvoiceStatus === "PAID"

  const openInSplit = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("invoice", invoice.id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <RowActions
      name={invoice.customerInvoiceNumber}
      primary={can("CUSTOMER_INVOICE", "edit") ? <InvoicePaymentButton invoice={invoice} compact /> : null}
      quickLook={(close) => (
        <CustomerInvoicePanel invoiceId={invoice.id} onClose={close} onDeleted={close} className="h-full" />
      )}
      menu={[
        [
          { label: "Open full page", icon: <IconArrowUpRight />, href: `/dashboard/customer-invoices/${invoice.id}` },
          { label: "Open in split view", icon: <IconLayoutColumns />, onSelect: openInSplit },
          canView("SALES") && {
            label: `Open job ${invoice.sales.salesNumber}`,
            icon: <IconBriefcase />,
            href: `/dashboard/sales/${invoice.sales.id}`,
          },
        ],
        [{ label: "Copy invoice number", icon: <IconCopy />, copy: invoice.customerInvoiceNumber }],
        [
          can("CUSTOMER_INVOICE", "delete") && {
            label: "Delete invoice",
            icon: <IconTrash />,
            tone: "danger",
            disabled: paid,
            hint: paid ? "Mark it unpaid first" : undefined,
            confirm: {
              title: `Delete ${invoice.customerInvoiceNumber}?`,
              description: "Its sellings become unbilled again and the number can be used for a new invoice.",
              onConfirm: () => remove.mutateAsync(invoice.id),
            },
          },
        ],
      ]}
    />
  )
}
