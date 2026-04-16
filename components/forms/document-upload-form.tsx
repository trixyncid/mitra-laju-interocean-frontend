import { IconPencil, IconPlus } from "@tabler/icons-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { useCreateShipmentOperationalAttachment, useUpdateShipmentOperationalAttachment } from "@/hooks/use-shipments"
import { toast } from "sonner"
import { useCreateCostingAttachment, useUpdateCostingAttachment } from "@/hooks/use-costings"

export default function DocumentUploadForm({
    shipmentId,
    costingId,
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
}) {
    const [open, setOpen] = useState(false)

    const createShipmentOperationalAttachment = useCreateShipmentOperationalAttachment(shipmentId ?? "")
    const updateShipmentOperationalAttachment = useUpdateShipmentOperationalAttachment(shipmentId ?? "")

    const createCostingAttachment = useCreateCostingAttachment(costingId ?? "")
    const updateCostingAttachment = useUpdateCostingAttachment(costingId ?? "")

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            shipmentId: shipmentId ?? undefined,
            costingId: costingId ?? undefined,
            attachmentName: attachmentName ?? "",
            document: document ?? null as File | null,
        },
        onSubmit: ({ value }) => {
            if (shipmentId !== undefined) {
                if (mode === "create") {
                    createShipmentOperationalAttachment.mutate({
                        shipmentId: shipmentId,
                        shipmentOperationalAttachment: {
                            attachmentName: value.attachmentName,
                            contentType: value.document?.type ?? "",
                            filePath: "shipment/" + value.document?.name,
                            size: value.document?.size ?? 0,
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
                } else {
                    updateShipmentOperationalAttachment.mutate({
                        shipmentId: shipmentId,
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
                        costingAttachment: {
                            attachmentName: value.attachmentName,
                            filePath: "costing/" + value.document?.name,
                            size: value.document?.size ?? 0,
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
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {
                        mode === "create" ? <Button variant="outline" size="sm"><IconPlus className="text-slate-500 size-4" />Upload</Button> : <Button variant="outline" size="sm"><IconPencil className="text-slate-500 size-4" /></Button>
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
                        <form.Field name="attachmentName" validators={{ onChange: ({ value }) => value == "" ? "Document Name is required" : undefined }}>
                            {(field) => (
                                <div className="">
                                    <Label htmlFor={field.name} className="mb-1">Document Name</Label>
                                    <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    { field.state.meta.errors ? (
                                        <em className="text-xs text-red-500">{ field.state.meta.errors }</em>
                                    ) : null }
                                </div>
                            )}
                        </form.Field>
                    </div>

                    <div className="my-3">
                        <form.Field name="document" validators={{ onChange: ({ value }) => !value ? "Document File is required" : undefined }}>
                            {(field) => (
                                <div className="">
                                    <Label htmlFor={field.name} className="mb-1">Document File</Label>
                                    <Input type="file" id={field.name} name={field.name} onChange={(e) => field.handleChange(e.target.files?.[0] ?? null)} />
                                    { field.state.meta.errors ? (
                                        <em className="text-xs text-red-500">{ field.state.meta.errors }</em>
                                    ) : null }
                                </div>
                            )}
                        </form.Field>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Upload</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}