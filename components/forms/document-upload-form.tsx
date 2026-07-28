import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { Button } from "../ui/button"
import { DeleteConfirmButton } from "../ui/delete-confirm-button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { TextField } from "../ui/text-field"
import { fieldError } from "@/lib/form-field"
import { attachmentNameSchema, documentFileSchema } from "@/lib/schemas/document"
import { zodOnChange } from "@/lib/zod-form"
import { useCreateShipmentOperationalAttachment, useDeleteShipmentOperationalAttachment, useUpdateShipmentOperationalAttachment } from "@/hooks/use-shipments"
import { toast } from "sonner"
import { useCreateCostingAttachment, useDeleteCostingAttachment, useUpdateCostingAttachment } from "@/hooks/use-costings"

export default function DocumentUploadForm({
    shipmentId,
    costingId,
    module,
    id,
    attachmentName,
    document,
    mode,
}: {
    shipmentId?: string | undefined
    costingId?: string | undefined
    id?: string | undefined
    attachmentName: string | undefined
    document: File | undefined
    mode: "create" | "edit"
    module: "shipment" | "costing"
}) {
    const [open, setOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const createShipmentOperationalAttachment = useCreateShipmentOperationalAttachment(shipmentId ?? "")
    const updateShipmentOperationalAttachment = useUpdateShipmentOperationalAttachment(shipmentId ?? "")
    const deleteShipmentOperationalAttachment = useDeleteShipmentOperationalAttachment(shipmentId ?? "")

    const createCostingAttachment = useCreateCostingAttachment(costingId ?? "")
    const updateCostingAttachment = useUpdateCostingAttachment(costingId ?? "")
    const deleteCostingAttachment = useDeleteCostingAttachment(costingId ?? "")

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            shipmentId: shipmentId ?? undefined,
            costingId: costingId ?? undefined,
            attachmentName: attachmentName ?? "",
            document: document ?? null as File | null,
        },
        onSubmit: async ({ value }) => {
            const formData = new FormData()

            formData.append("attachmentName", value.attachmentName)
            formData.append("contentType", value.document?.type ?? "")
            formData.append("document", value.document ?? new File([], ""))
            formData.append("filePath", value.document?.name ?? "")
            formData.append("size", value.document?.size.toString() ?? "0")
            formData.append("fileName", value.document?.name ?? "")
            formData.append("shipmentId", shipmentId ?? "")
            formData.append("costingId", costingId ?? "")

            if (module === "shipment") {
                if (mode === "create") {
                    createShipmentOperationalAttachment.mutate({
                        shipmentId: shipmentId ?? "",
                        shipmentOperationalAttachment: formData,
                    }, {
                        onSuccess: () => {
                            setOpen(false)
                            form.reset()
                        },
                        onError: (error: Error) => {
                            toast.error(error.message)
                        }
                    })
                } else {
                    updateShipmentOperationalAttachment.mutate({
                        shipmentId: shipmentId ?? "",
                        id: id ?? "",
                        shipmentOperationalAttachment: {
                            attachmentName: value.attachmentName,
                            shipmentId: shipmentId,
                        },
                    }, {
                        onSuccess: () => {
                            setOpen(false)
                            form.reset()
                        },
                        onError: (error: Error) => {
                            toast.error(error.message)
                        }
                    })
                }
            } else {
                if (mode === "create") {
                    createCostingAttachment.mutate({
                        costingId: costingId ?? "",
                        costingAttachment: formData,
                    }, {
                        onSuccess: () => {
                            setOpen(false)
                            form.reset()
                        },
                        onError: (error: Error) => {
                            toast.error(error.message)
                        }
                    })
                } else {
                    updateCostingAttachment.mutate({
                        costingId: costingId ?? "",
                        id: id ?? "",
                        costingAttachment: {
                            attachmentName: value.attachmentName,
                            costingId: costingId,
                        },
                    }, {
                        onSuccess: () => {
                            setOpen(false)
                            form.reset()
                        },
                        onError: (error: Error) => {
                            toast.error(error.message)
                        }
                    })
                }
            }
        }
    })

    return (
        <div className="flex items-center gap-x-2">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {
                        mode === "create" ? <Button variant="outline" size="sm"><IconPlus className="text-muted-foreground size-4" />Upload</Button> : <Button variant="outline" size="icon"><IconPencil className="text-muted-foreground size-4" /></Button>
                    }
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        { mode === "create" ? <DialogTitle>Upload New Document</DialogTitle> : <DialogTitle>Edit Document</DialogTitle>}
                    </DialogHeader>
                    <form onSubmit={
                        (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }
                    }>
                    <div className="my-3">
                        <form.Field name="attachmentName" validators={{ onChange: zodOnChange(attachmentNameSchema) }}>
                            {(field) => (
                                <div className="">
                                    <TextField
                                        label="Document Name"
                                        required
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={fieldError(field.state.meta.errors)}
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {
                        mode === "create" ? (
                            <div className="my-3">
                                <form.Field name="document" validators={{ onChange: zodOnChange(documentFileSchema) }}>
                                    {(field) => (
                                        <div className="">
                                            <TextField
                                                label="Document File"
                                                required
                                                id={field.name}
                                                name={field.name}
                                                type="file"
                                                onChange={(e) => field.handleChange(e.target.files?.[0] ?? null)}
                                                error={fieldError(field.state.meta.errors)}
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        ) : (
                            <></>
                        )
                    }
                    <DialogFooter>
                        <Button type="submit" disabled={ mode === "create" ? createShipmentOperationalAttachment.isPending || createCostingAttachment.isPending : updateShipmentOperationalAttachment.isPending || updateCostingAttachment.isPending }>{ mode === "create" ? (createShipmentOperationalAttachment.isPending || createCostingAttachment.isPending ? "Uploading..." : "Upload") : (updateShipmentOperationalAttachment.isPending || updateCostingAttachment.isPending ? "Updating..." : "Save Changes")}</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {
                mode === "edit" ? (
                    <Dialog
                        open={deleteOpen}
                        onOpenChange={(next) => {
                            if (deleteShipmentOperationalAttachment.isPending || deleteCostingAttachment.isPending) return
                            setDeleteOpen(next)
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon"><IconTrash className="text-[var(--mli-on-error-container)] size-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Document</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                Are you sure you want to delete this document? This action cannot be undone.
                            </DialogDescription>
                            <DialogFooter>
                                <DeleteConfirmButton
                                    isPending={
                                        shipmentId !== undefined
                                            ? deleteShipmentOperationalAttachment.isPending
                                            : deleteCostingAttachment.isPending
                                    }
                                    onClick={() => {
                                        if (shipmentId !== undefined) {
                                            deleteShipmentOperationalAttachment.mutate({
                                                shipmentId: shipmentId,
                                                id: id ?? "",
                                            }, {
                                                onSuccess: () => {
                                                    setDeleteOpen(false)
                                                    form.reset()
                                                },
                                                onError: (error: Error) => {
                                                    toast.error(error.message)
                                                }
                                            })
                                        } else {
                                            deleteCostingAttachment.mutate({
                                                costingId: costingId ?? "",
                                                id: id ?? "",
                                            }, {
                                                onSuccess: () => {
                                                    setDeleteOpen(false)
                                                    form.reset()
                                                },
                                                onError: (error: Error) => {
                                                    toast.error(error.message)
                                                }
                                            })
                                        }
                                    }}
                                />
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        disabled={deleteShipmentOperationalAttachment.isPending || deleteCostingAttachment.isPending}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <></>
                )
            }
        </div>
    )
}