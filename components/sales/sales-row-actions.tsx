"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowUpRight, IconCopy, IconLayoutColumns, IconTrash } from "@tabler/icons-react"

import { RowActions } from "@/components/row-actions/row-actions"
import { SalesPanel } from "@/components/sales/sales-panel"
import { usePermissions } from "@/hooks/use-permissions"
import { useDeleteSales } from "@/hooks/use-sales"
import { shipmentReference } from "@/lib/shipment-reference"
import type { Sales } from "@/lib/types/sales"

/** Quick look, open, copy and delete for one job in the sales table. */
export function SalesRowActions({ sales }: { sales: Sales }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can } = usePermissions()
  const remove = useDeleteSales()
  const invoiced = sales._count.customerInvoices > 0
  const lines = sales.costings.length + sales.sellings.length

  const openInSplit = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sales", sales.id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <RowActions
      name={sales.salesNumber}
      quickLook={(close) => <SalesPanel salesId={sales.id} onClose={close} onDeleted={close} className="h-full" />}
      menu={[
        [
          { label: "Open full page", icon: <IconArrowUpRight />, href: `/dashboard/sales/${sales.id}` },
          { label: "Open in split view", icon: <IconLayoutColumns />, onSelect: openInSplit },
        ],
        [{ label: "Copy sales number", icon: <IconCopy />, copy: sales.salesNumber }],
        [
          can("SALES", "delete") && {
            label: "Delete job",
            icon: <IconTrash />,
            tone: "danger",
            disabled: invoiced,
            hint: invoiced ? "Delete its invoices first" : undefined,
            confirm: {
              title: `Delete ${sales.salesNumber}?`,
              description: [
                "The job will be removed.",
                sales.shipment ? ` Shipment ${shipmentReference(sales.shipment)} will be free to use in another job.` : "",
                lines ? ` Its ${lines} line${lines === 1 ? "" : "s"} are kept and can join another job.` : "",
              ].join(""),
              onConfirm: () => remove.mutateAsync(sales.id),
            },
          },
        ],
      ]}
    />
  )
}
