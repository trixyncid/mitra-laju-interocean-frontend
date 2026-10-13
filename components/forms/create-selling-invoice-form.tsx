"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { IconFileInvoice, IconPlus } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TextField } from "@/components/ui/text-field"
import { metadataIconWell } from "@/lib/design"
import { useCreateSelling } from "@/hooks/use-sellings"

export default function CreateSellingInvoiceForm({
  shipmentId,
  trigger,
}: {
  shipmentId: string
  trigger?: ReactNode
}) {
  const router = useRouter()
  const createSelling = useCreateSelling()
  const [open, setOpenState] = useState(false)
  const [remarks, setRemarks] = useState("")

  function setOpen(next: boolean) {
    if (createSelling.isPending) return
    setOpenState(next)
    if (!next) setRemarks("")
  }

  const canSubmit = remarks.trim().length > 0

  function handleSubmit() {
    if (!canSubmit || createSelling.isPending) return

    const now = new Date()
    createSelling.mutate(
      {
        shipmentId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        remarks: remarks.trim(),
      },
      {
        onSuccess: (created) => {
          setOpen(false)
          const id =
            created &&
            typeof created === "object" &&
            "id" in created &&
            typeof (created as { id: unknown }).id === "string"
              ? (created as { id: string }).id
              : null
          if (id) {
            router.push(`/dashboard/sellings/${id}`)
          }
        },
        onError: (error: Error) => toast.error(error.message),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" className="gap-2">
            <IconPlus className="size-4" />
            Create invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={!createSelling.isPending}
      >
        <DialogHeader className="gap-3 border-b border-[rgba(var(--mli-tint-rgb),0.4)] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className={metadataIconWell} aria-hidden>
              <IconFileInvoice className="size-4" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>Create customer invoice</DialogTitle>
              <DialogDescription>
                Add the remark the customer should see on this invoice.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 sm:px-8">
          <TextField
            id="invoice-remarks"
            label="Customer remark"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="What the customer should see for this invoice"
            required
          />
        </div>

        <DialogFooter className="border-t border-[rgba(var(--mli-tint-rgb),0.4)] bg-[rgba(var(--mli-panel-rgb),0.45)] px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createSelling.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || createSelling.isPending}
            className="min-w-36 gap-2"
          >
            {createSelling.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <IconFileInvoice className="size-4" />
                Create draft
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
