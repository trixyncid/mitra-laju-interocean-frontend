"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowUpRight, IconCopy, IconLayoutColumns, IconPencil, IconTrash } from "@tabler/icons-react"

import { RowActions } from "@/components/row-actions/row-actions"
import { SellingFormDialog } from "@/components/sellings/selling-form-dialog"
import { SellingPanel } from "@/components/sellings/selling-panel"
import { useDeleteSellingLine } from "@/hooks/use-selling-lines"
import { usePermissions } from "@/hooks/use-permissions"
import type { Selling } from "@/lib/types/selling"

/** Quick look, open, edit, copy and delete for one selling row. */
export function SellingRowActions({ selling }: { selling: Selling }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can } = usePermissions()
  const remove = useDeleteSellingLine()
  const [editing, setEditing] = useState(false)
  const name = selling.sellingDescription
  const invoice = selling.customerInvoice

  const openInSplit = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("selling", selling.id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <RowActions
        name={name}
        quickLook={(close) => <SellingPanel sellingId={selling.id} onClose={close} onDeleted={close} className="h-full" />}
        menu={[
          [
            { label: "Open full page", icon: <IconArrowUpRight />, href: `/dashboard/sellings/${selling.id}` },
            { label: "Open in split view", icon: <IconLayoutColumns />, onSelect: openInSplit },
          ],
          [
            can("SELLING", "edit") && { label: "Edit line", icon: <IconPencil />, onSelect: () => setEditing(true) },
            { label: "Copy description", icon: <IconCopy />, copy: name },
          ],
          [
            can("SELLING", "delete") && {
              label: "Delete line",
              icon: <IconTrash />,
              tone: "danger",
              // The server refuses to delete a billed line; say why up front.
              disabled: Boolean(invoice),
              hint: invoice ? `Billed on ${invoice.customerInvoiceNumber}. Remove it from the invoice first.` : undefined,
              confirm: {
                title: "Delete selling line?",
                description: `This removes "${name}". It can't be undone.`,
                onConfirm: () => remove.mutateAsync(selling.id),
              },
            },
          ],
        ]}
      />
      {editing ? (
        <SellingFormDialog
          mode="edit"
          selling={selling}
          defaultOpen
          // The menu opens the form; it unmounts again when closed.
          trigger={<span hidden />}
          onOpenChange={(open) => !open && setEditing(false)}
        />
      ) : null}
    </>
  )
}
