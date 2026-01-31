"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ISOFormat } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";

export default function VesselForm({
    mode,
    vesselName,
    voyage,
    etd,
    closingReefer,
    isActive
}: {
    mode: "edit" | "create",
    vesselName: string | undefined,
    voyage: string | undefined,
    etd: string | undefined,
    closingReefer: string | undefined,
    isActive: boolean | undefined
}) {
    const form = useForm({
        defaultValues: {
            vesselName: vesselName ?? "",
            voyage: voyage ?? "",
            etd: etd ?? "",
            closingReefer: closingReefer ?? "",
            isActive: isActive ?? true,
        },
        onSubmit: ({ value }) => {
            console.log(value)
        }
    })

    return (
        <div>
            <Dialog onOpenChange={(open) => {
                if (!open) form.reset()
            }}>
                <DialogTrigger asChild>
                    <Button>{ mode === "edit" ? <IconEdit /> : <><IconPlus /> Add Vessel</>}</Button>
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
                                name="voyage"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Voyage is required" : undefined,
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
                                            onChange={(e) => field.handleChange(ISOFormat(e.target.value))}
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
                                            onChange={(e) => field.handleChange(ISOFormat(e.target.value))}
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
                            <Button type="submit">{ mode === "edit" ? "Save Changes" : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}