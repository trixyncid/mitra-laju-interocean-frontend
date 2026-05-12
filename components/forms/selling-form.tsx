"use client"

import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPencil, IconPlus } from "@tabler/icons-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useState } from "react"
import { useCreateSelling, useUpdateSelling } from "@/hooks/use-sellings"
import { toast } from "sonner"

/**
 * Generates a selling number in the format SL-{YYMM}-{XXXX}
 * where YYMM is the last 2 digits of the year followed by 2-digit month,
 * and XXXX is a 4-character random alphanumeric string.
 * Example: SL-2610-A3B9 (October 2026)
 */
const generateSellingNumber = (): string => {
    const now = new Date()
    const year = String(now.getFullYear()).slice(2)
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const dateCode = `${year}${month}`
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const randomStr = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    return `SL-${dateCode}-${randomStr}`
}

export default function SellingForm({
    mode,
    id,
    sellingNumber,
    description,
    amount,
    vatPercentage,
    pph23Percentage,
}: {
    mode: "edit" | "create"
    id: string | undefined
    sellingNumber: string | undefined
    description: string | undefined
    amount: number | undefined
    vatPercentage: number | undefined
    pph23Percentage: number | undefined
}) {
    const [open, setOpen] = useState(false)
    const [autoSellingNumber] = useState<string>(() => generateSellingNumber())

    const createSelling = useCreateSelling()
    const updateSelling = useUpdateSelling()

    const form = useForm({
        defaultValues: {
            sellingNumber: mode === "edit" ? (sellingNumber ?? "") : autoSellingNumber,
            description: description ?? "",
            amount: amount ?? "",
            vatPercentage: vatPercentage ?? "",
            pph23Percentage: pph23Percentage ?? "",
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createSelling.mutate({
                    sellingNumber: value.sellingNumber,
                    description: value.description,
                    amount: Number(value.amount),
                    vatPercentage: Number(value.vatPercentage),
                    pph23Percentage: Number(value.pph23Percentage),
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
                updateSelling.mutate({
                    id: id as string,
                    selling: {
                        sellingNumber: value.sellingNumber,
                        description: value.description,
                        amount: Number(value.amount),
                        vatPercentage: Number(value.vatPercentage),
                        pph23Percentage: Number(value.pph23Percentage),
                    }
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
    })

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {mode === "edit"
                        ? <Button size="icon" variant="outline"><IconPencil /></Button>
                        : <Button><IconPlus /> Add Selling</Button>
                    }
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{mode === "edit" ? "Edit Selling" : "Add Selling"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field name="sellingNumber">
                                {(field) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Selling Number</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            disabled
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="description"
                                validators={{ onChange: ({ value }) => !value ? "Description is required" : undefined }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Description</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="amount"
                                validators={{ onChange: ({ value }) => value === "" ? "Amount is required" : undefined }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Amount (Rp)</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            type="number"
                                            step="0.01"
                                        />
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="vatPercentage"
                                validators={{ onChange: ({ value }) => value === "" ? "VAT is required. Input zero if not applicable" : Number(value) > 100 ? "VAT must be ≤ 100" : undefined }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">VAT (%)</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            type="number"
                                            step="0.01"
                                        />
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="pph23Percentage"
                                validators={{ onChange: ({ value }) => value === "" ? "PPH 23 is required. Input zero if not applicable" : Number(value) > 100 ? "PPH 23 must be ≤ 100" : undefined }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">PPH 23 (%)</Label>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(Number(e.target.value))}
                                            type="number"
                                            step="0.01"
                                        />
                                        {field.state.meta.errors ? (
                                            <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                        ) : null}
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={createSelling.isPending || updateSelling.isPending}>
                                {mode === "edit"
                                    ? (updateSelling.isPending ? "Updating..." : "Save Changes")
                                    : (createSelling.isPending ? "Creating..." : "Create")
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
