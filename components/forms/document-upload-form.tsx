"use client"

import { useState } from "react"
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

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
import { DocumentFilePicker } from "@/components/ui/document-file-picker"
import { TextField } from "@/components/ui/text-field"
import {
  useCreateVendorInvoiceAttachment,
  useDeleteVendorInvoiceAttachment,
  useUpdateVendorInvoiceAttachment,
} from "@/hooks/use-vendor-invoices"
import {
  useCreateShipmentOperationalAttachment,
  useDeleteShipmentOperationalAttachment,
  useUpdateShipmentOperationalAttachment,
} from "@/hooks/use-shipments"
import { fieldError } from "@/lib/form-field"
import { attachmentNameSchema, documentFileSchema } from "@/lib/schemas/document"
import { zodOnChange } from "@/lib/zod-form"

type DocumentOwner =
  | { shipmentId: string; vendorInvoiceId?: never }
  | { vendorInvoiceId: string; shipmentId?: never }

export default function DocumentUploadForm({
  shipmentId,
  vendorInvoiceId,
  id,
  attachmentName,
  document,
  mode,
}: DocumentOwner & {
  id?: string | undefined
  attachmentName: string | undefined
  document: File | undefined
  mode: "create" | "edit"
}) {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const createShipmentOperationalAttachment =
    useCreateShipmentOperationalAttachment(shipmentId ?? "")
  const updateShipmentOperationalAttachment =
    useUpdateShipmentOperationalAttachment(shipmentId ?? "")
  const deleteShipmentOperationalAttachment =
    useDeleteShipmentOperationalAttachment(shipmentId ?? "")

  const createVendorInvoiceAttachment = useCreateVendorInvoiceAttachment(
    vendorInvoiceId ?? ""
  )
  const updateVendorInvoiceAttachment = useUpdateVendorInvoiceAttachment(
    vendorInvoiceId ?? ""
  )
  const deleteVendorInvoiceAttachment = useDeleteVendorInvoiceAttachment(
    vendorInvoiceId ?? ""
  )

  const isCreatePending =
    createShipmentOperationalAttachment.isPending ||
    createVendorInvoiceAttachment.isPending
  const isUpdatePending =
    updateShipmentOperationalAttachment.isPending ||
    updateVendorInvoiceAttachment.isPending
  const isDeletePending =
    deleteShipmentOperationalAttachment.isPending ||
    deleteVendorInvoiceAttachment.isPending

  const closeAfterSave = {
    onSuccess: () => {
      setOpen(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  }
  const closeAfterDelete = {
    onSuccess: () => {
      setDeleteOpen(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  }

  const form = useForm({
    defaultValues: {
      id: id ?? "",
      attachmentName: attachmentName ?? "",
      document: (document ?? null) as File | null,
    },
    onSubmit: async ({ value }) => {
      if (vendorInvoiceId) {
        if (mode === "create") {
          const formData = new FormData()
          formData.append("attachmentName", value.attachmentName)
          formData.append("document", value.document ?? new File([], ""))
          createVendorInvoiceAttachment.mutate(formData, closeAfterSave)
        } else {
          updateVendorInvoiceAttachment.mutate(
            { id: id ?? "", attachmentName: value.attachmentName },
            closeAfterSave
          )
        }
        return
      }

      const formData = new FormData()

      formData.append("attachmentName", value.attachmentName)
      formData.append("contentType", value.document?.type ?? "")
      formData.append("document", value.document ?? new File([], ""))
      formData.append("filePath", value.document?.name ?? "")
      formData.append("size", value.document?.size.toString() ?? "0")
      formData.append("fileName", value.document?.name ?? "")
      formData.append("shipmentId", shipmentId ?? "")

      if (mode === "create") {
        createShipmentOperationalAttachment.mutate(
          {
            shipmentId: shipmentId ?? "",
            shipmentOperationalAttachment: formData,
          },
          closeAfterSave
        )
      } else {
        updateShipmentOperationalAttachment.mutate(
          {
            shipmentId: shipmentId ?? "",
            id: id ?? "",
            shipmentOperationalAttachment: {
              attachmentName: value.attachmentName,
              shipmentId,
            },
          },
          closeAfterSave
        )
      }
    },
  })

  return (
    <div className="flex items-center gap-x-2">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) form.reset()
        }}
      >
        <DialogTrigger asChild>
          {mode === "create" ? (
            <Button variant="outline" size="sm">
              <IconPlus className="size-4 text-muted-foreground" />
              Upload
            </Button>
          ) : (
            <Button variant="outline" size="icon">
              <IconPencil className="size-4 text-muted-foreground" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Upload New Document" : "Edit Document"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a clear name, then drop or browse for the file you want to attach."
                : "Update the display name for this document."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            {mode === "create" ? (
              <form.Field
                name="document"
                validators={{ onChange: zodOnChange(documentFileSchema) }}
              >
                {(field) => (
                  <DocumentFilePicker
                    id={field.name}
                    required
                    value={field.state.value}
                    error={fieldError(field.state.meta.errors)}
                    onInvalid={(message) => toast.error(message)}
                    onChange={(file) => field.handleChange(file)}
                  />
                )}
              </form.Field>
            ) : null}

            <form.Field
              name="attachmentName"
              validators={{ onChange: zodOnChange(attachmentNameSchema) }}
            >
              {(field) => (
                <TextField
                  label="Document Name"
                  required
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isCreatePending || isUpdatePending}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  mode === "create" ? isCreatePending : isUpdatePending
                }
              >
                {mode === "create"
                  ? isCreatePending
                    ? "Uploading…"
                    : "Upload"
                  : isUpdatePending
                    ? "Updating…"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {mode === "edit" ? (
        <Dialog
          open={deleteOpen}
          onOpenChange={(next) => {
            if (isDeletePending) return
            setDeleteOpen(next)
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <IconTrash className="size-4 text-[var(--mli-on-error-container)]" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </DialogDescription>
            <DialogFooter>
              <DeleteConfirmButton
                isPending={isDeletePending}
                onClick={() => {
                  if (vendorInvoiceId) {
                    deleteVendorInvoiceAttachment.mutate(id ?? "", closeAfterDelete)
                  } else {
                    deleteShipmentOperationalAttachment.mutate(
                      { shipmentId: shipmentId ?? "", id: id ?? "" },
                      closeAfterDelete
                    )
                  }
                }}
              />
              <DialogClose asChild>
                <Button variant="secondary" disabled={isDeletePending}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}
