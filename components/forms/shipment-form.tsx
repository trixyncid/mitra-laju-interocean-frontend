"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";

export default function ShipmentForm({
    mode,
    orderNumber,
    customerCode,
    customerShipper
}: {
    mode: "edit" | "create",
    orderNumber: string | undefined,
    customerCode: string | undefined,
    customerShipper: string | undefined
}) {
    const form = useForm({
        defaultValues: {
            orderNumber: orderNumber ?? "",
            customerCode: customerCode ?? "",
            customerShipper: customerShipper ?? "",
        },
        onSubmit: async ({ value }) => {
            console.log(value)
        }
    })
    return (
        <div>
            <Dialog onOpenChange={(open) => {
                if (!open) form.reset()
            }}>    
                <DialogTrigger asChild>
                    <Button>{ mode === "edit" ? <IconEdit /> : <><IconPlus /> Add Shipment</>}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={
                        (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }
                    }>
                        <div>
                            <form.Field
                                name="orderNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Order Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Order Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="customerCode"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Customer Code is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Customer Code</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={field.handleChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select customer code" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="value">Apple</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="customerShipper"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Customer Shipper is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Customer Shipper</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={field.handleChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select customer shipper" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="value">Apple</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
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