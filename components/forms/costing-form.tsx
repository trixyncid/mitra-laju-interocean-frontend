"use client"

import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconEdit, IconPlus } from "@tabler/icons-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export default function CostingForm({
    mode,
    description,
    price,
    currency,
    containerNumber,
    vat,
    pph23,
    vendorInvoiceNumber,
    vendorName,
}: {
    mode: "edit" | "create"
    description: string | undefined,
    price: number | undefined,
    currency: number | undefined,
    containerNumber: string | undefined,
    vat: number | undefined,
    pph23: number | undefined,
    vendorInvoiceNumber: string | undefined,
    vendorName: string | undefined,
}) {
    const form = useForm({
        defaultValues: {
            description: description ?? "",
            price: price ?? "",
            currency: currency ?? "",
            containerNumber: containerNumber ?? "",
            vat: vat ?? 0,
            pph23: pph23 ?? 0,
            vendorInvoiceNumber: vendorInvoiceNumber ?? "",
            vendorName: vendorName ?? "",
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
                    <Button>{ mode === "edit" ? <><IconEdit /> Edit Costing</> : <><IconPlus /> Add Costing</>}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ mode === "edit" ? "Edit Costing" : "Add Costing"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field name="description" validators={{ onChange: ({ value }) => !value ? "Description is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Description</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="price" validators={{ onChange: ({ value }) => !value ? "Price is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Price</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="currency" validators={{ onChange: ({ value }) => !value ? "Currency is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Currency</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="containerNumber" validators={{ onChange: ({ value }) => !value ? "Container Number is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Container Number</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a container number" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Container 1</SelectItem>
                                                <SelectItem value="2">Container 2</SelectItem>
                                                <SelectItem value="3">Container 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vat">
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">VAT (%)</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="pph23">
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">PPH 23 (%)</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} type="number" step="0.01" />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorInvoiceNumber" validators={{ onChange: ({ value }) => !value ? "Vendor Invoice Number is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor Invoice Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="vendorName" validators={{ onChange: ({ value }) => !value ? "Vendor Name is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Vendor Name</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a vendor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">PT. ABC</SelectItem>
                                                <SelectItem value="2">PT. XYZ</SelectItem>
                                                <SelectItem value="3">PT. LMN</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
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