"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowUpRight, IconCopy, IconLayoutColumns, IconPencil, IconTrash } from "@tabler/icons-react"

import { CostingFormDialog } from "@/components/costings/costing-form-dialog"
import { CostingPanel } from "@/components/costings/costing-panel"
import { RowActions } from "@/components/row-actions/row-actions"
import { useDeleteCosting } from "@/hooks/use-costings"
import { usePermissions } from "@/hooks/use-permissions"
import { costingLabel, type Costing } from "@/lib/types/costing"

/** Quick look, open, edit, copy and delete for one costing row. */
export function CostingRowActions({ costing }: { costing: Costing }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can } = usePermissions()
  const remove = useDeleteCosting()
  const [editing, setEditing] = useState(false)
  const name = costingLabel(costing)

  const openInSplit = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("costing", costing.id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <RowActions
        name={name}
        quickLook={(close) => <CostingPanel costingId={costing.id} onClose={close} onDeleted={close} className="h-full" />}
        menu={[
          [
            { label: "Open full page", icon: <IconArrowUpRight />, href: `/dashboard/costings/${costing.id}` },
            { label: "Open in split view", icon: <IconLayoutColumns />, onSelect: openInSplit },
          ],
          [
            can("COSTING", "edit") && { label: "Edit line", icon: <IconPencil />, onSelect: () => setEditing(true) },
            { label: "Copy description", icon: <IconCopy />, copy: name },
          ],
          [
            can("COSTING", "delete") && {
              label: "Delete line",
              icon: <IconTrash />,
              tone: "danger",
              confirm: {
                title: "Delete costing line?",
                description: `This removes "${name}" from ${costing.vendor.vendorName}. It can't be undone.`,
                onConfirm: () => remove.mutateAsync(costing.id),
              },
            },
          ],
        ]}
      />
      {editing ? (
        <CostingFormDialog
          mode="edit"
          costing={costing}
          defaultOpen
          // The menu opens the form; it unmounts again when closed.
          trigger={<span hidden />}
          onOpenChange={(open) => !open && setEditing(false)}
        />
      ) : null}
    </>
  )
}
