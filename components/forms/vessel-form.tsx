"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                                    onChange: ({ value }) =>
                                        !value ? "Vessel Name is required" : undefined,
                                }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vessel Name</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            type="text"
                                        />
                                        { field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{ field.state.meta.errors }</em>
                                        ) : null }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="voyageNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Voyage Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Voyage</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            type="text"
                                        />
                                        { field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{ field.state.meta.errors }</em>
                                        ) : null }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="etd"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">ETD</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value ? field.state.value.split('T')[0] : ''}
                                            onChange={(e) => field.handleChange(e.target.value ? ISOFormat(e.target.value) : "")}
                                            type="date"
                                        />
                                        { field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{ field.state.meta.errors }</em>
                                        ) : null }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="closingReefer"
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Closing Reefer</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value ? field.state.value.split('T')[0] : ''}
                                            onChange={(e) => field.handleChange(e.target.value ? ISOFormat(e.target.value) : "")}
                                            type="date"
                                        />
                                        { field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{ field.state.meta.errors }</em>
                                        ) : null }
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