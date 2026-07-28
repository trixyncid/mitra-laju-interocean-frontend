"use client"

import { ActiveStatusField } from "@/components/forms/active-status-field";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { fieldError } from "@/lib/form-field"
import { vesselNameSchema, voyageNumberSchema } from "@/lib/schemas/vessel"
import { zodOnChange } from "@/lib/zod-form";
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
                                            required
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
                                            required
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
                                        <DatePicker
                                            label="ETD"
                                            id={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            placeholder="Pick ETD"
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="closingReefer"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <DatePicker
                                            label="Closing Reefer"
                                            id={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            placeholder="Pick closing reefer date"
                                        />
                                    </div>
                                )}
                            </form.Field>
                            {mode === "edit" ? (
                                <form.Field name="isActive">
                                    {(field) => (
                                        <div className="my-3">
                                            <ActiveStatusField
                                                id={field.name}
                                                value={field.state.value === true}
                                                onChange={(checked) => field.handleChange(checked)}
                                                description="Inactive vessels stay in history but are hidden when creating new shipments."
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            ) : null}
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