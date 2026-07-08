"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TextField } from "@/components/ui/text-field";
import { fieldError } from "@/lib/form-field"
import { vesselNameSchema, voyageNumberSchema } from "@/lib/schemas/vessel"
import { zodOnChange } from "@/lib/zod-form";
import { ISOFormat } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useCreateVessel, useUpdateVessel } from "@/hooks/use-vessels";
import { useState } from "react";
import { Pencil } from "lucide-react";

export default function VesselForm({
    mode,
    id,
    vesselName,
    voyageNumber,
    etd,
    closingReefer,
    isActive
}: {
    mode: "edit" | "create",
    id: string | undefined,
    vesselName: string | undefined,
    voyageNumber: string | undefined,
    etd: string | undefined,
    closingReefer: string | undefined,
    isActive: boolean | undefined
}) {
    const [open, setOpen] = useState(false)

    const createVessel = useCreateVessel()
    const updateVessel = useUpdateVessel()

    const form = useForm({
        defaultValues: {
            id: id ?? "",
            vesselName: vesselName ?? "",
            voyageNumber: voyageNumber ?? "",
            etd: etd ?? "",
            closingReefer: closingReefer ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: ({ value }) => {
            if (mode === "create") {
                createVessel.mutate({
                    vesselName: value.vesselName,
                    voyageNumber: value.voyageNumber,
                    etd: value.etd === "" ? null : value.etd,
                    closingReefer: value.closingReefer === "" ? null : value.closingReefer,
                    isActive: value.isActive,
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            } else {
                const vesselId = value.id

                updateVessel.mutate({
                    id: vesselId,
                    vessel: {
                        id: value.id,
                        vesselName: value.vesselName,
                        voyageNumber: value.voyageNumber,
                        etd: value.etd === "" ? null : value.etd,
                        closingReefer: value.closingReefer === "" ? null : value.closingReefer,
                        isActive: value.isActive,
                    }
                }, {
                    onSuccess: () => {
                        setOpen(false)
                        form.reset()
                    }
                })
            }
        }
    })

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    { mode === "edit" ? <Button variant="outline" size="icon"><Pencil /></Button> : <Button><IconPlus /> Add Vessel</Button>}
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Vessel" : "Create New Vessel"}</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                    >
                        <div>
                            <form.Field
                                name="vesselName"
                                validators={{
                                    onChange: zodOnChange(vesselNameSchema),
                                }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Vessel Name"
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="voyageNumber"
                                validators={{
                                    onChange: zodOnChange(voyageNumberSchema),
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Voyage"
                                            id={field.name}
                                            name={field.name}
                                            type="text"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="etd"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="ETD"
                                            id={field.name}
                                            name={field.name}
                                            type="date"
                                            value={field.state.value ? field.state.value.split('T')[0] : ''}
                                            onChange={(e) => field.handleChange(e.target.value ? ISOFormat(e.target.value) : "")}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="closingReefer"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Closing Reefer"
                                            id={field.name}
                                            name={field.name}
                                            type="date"
                                            value={field.state.value ? field.state.value.split('T')[0] : ''}
                                            onChange={(e) => field.handleChange(e.target.value ? ISOFormat(e.target.value) : "")}
                                            error={fieldError(field.state.meta.errors)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                            { mode === "edit" ? <form.Field
                                name="isActive"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Switch id={field.name} checked={field.state.value === true} onCheckedChange={(checked) => field.handleChange(checked)} />
                                        <Label htmlFor={field.name} className="my-2">Is Active</Label>
                                    </div>
                                )}
                            </form.Field> : null}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={ mode === "create" ? createVessel.isPending : false || mode === "edit" ? updateVessel.isPending : false}>{ mode === "edit" ? (updateVessel.isPending ? "Updating..." : "Save Changes") : (createVessel.isPending ? "Creating..." : "Create")}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}