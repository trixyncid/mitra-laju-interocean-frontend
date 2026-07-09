"use client"

import { useForm } from "@tanstack/react-form"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { IconPencil, IconPlus } from "@tabler/icons-react"
import { TextField } from "../ui/text-field"
import { NumberField } from "../ui/number-field"
import { FormLabel } from "../ui/form-label"
import { FieldDescription } from "../ui/field"
import { fieldError } from "@/lib/form-field"
import {
  sellingAmountSchema,
  sellingDescriptionSchema,
  sellingPph23Schema,
  sellingVatSchema,
} from "@/lib/schemas/selling"
import { zodOnChange } from "@/lib/zod-form"
import { useState } from "react"
import { useCreateSelling, useUpdateSelling } from "@/hooks/use-sellings"
import { toast } from "sonner"

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

    const createSelling = useCreateSelling()
    const updateSelling = useUpdateSelling()

    const form = useForm({
        defaultValues: {
            description: description ?? "",
            amount: amount ?? "",
            vatPercentage: vatPercentage ?? "",
            pph23Percentage: pph23Percentage ?? "",
        },
        onSubmit: async ({ value }) => {
            if (mode === "create") {
                createSelling.mutate({
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
                            {mode === "edit" && sellingNumber ? (
                                <div className="my-3">
                                    <FormLabel className="my-2">Selling Number</FormLabel>
                                    <p className="text-sm font-medium">{sellingNumber}</p>
                                </div>
                            ) : null}
                            {mode === "create" ? (
                                <FieldDescription className="my-3">
                                    The selling number will be generated automatically when you create this selling.
                                </FieldDescription>
                            ) : null}
                            <form.Field
                                name="description"
                                validators={{ onChange: zodOnChange(sellingDescriptionSchema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <TextField
                                            label="Description"
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
                            <form.Field
                                name="amount"
                                validators={{ onChange: zodOnChange(sellingAmountSchema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <NumberField
                                            label="Amount (Rp)"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="vatPercentage"
                                validators={{ onChange: zodOnChange(sellingVatSchema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <NumberField
                                            label="VAT (%)"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            useGrouping={false}
                                            maximumFractionDigits={2}
                                            placeholder="0"
                                        />
                                    </div>
                                )}
                            </form.Field>
                            <form.Field
                                name="pph23Percentage"
                                validators={{ onChange: zodOnChange(sellingPph23Schema) }}
                            >
                                {(field) => (
                                    <div className="my-3">
                                        <NumberField
                                            label="PPH 23 (%)"
                                            required
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onValueChange={(nextValue) => field.handleChange(nextValue)}
                                            error={fieldError(field.state.meta.errors)}
                                            useGrouping={false}
                                            maximumFractionDigits={2}
                                            placeholder="0"
                                        />
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
