"use client"

import { useForm } from "@tanstack/react-form"
import { Button } from "../ui/button"
import { IconPlus } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Label } from "../ui/label"
import { useCostings, useUpdateCosting } from "@/hooks/use-costings"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Costing } from "@/app/dashboard/costings/columns"
import { costingSelectionSchema } from "@/lib/schemas/link"
import { zodOnChange } from "@/lib/zod-form"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { fieldError } from "@/lib/form-field"

export default function LinkSellingCostingForm({
    sellingId,
}: {
    sellingId: string
}) {
    const [open, setOpen] = useState(false)

    const { data: costingsData, isLoading } = useCostings({ page: 1, pageSize: 100 })
    const costings = costingsData?.items
    const updateCosting = useUpdateCosting()
    const queryClient = useQueryClient()

    type ComboItem = { value: string; label: string }
    const costingItems: ComboItem[] = useMemo(
        () =>
            costings
                ?.filter((c: Costing) => !c.sellingId)
                .map((c: Costing) => ({
                    value: c.id,
                    label: `${c.costingNumber} — ${c.description}`,
                })) ?? [],
        [costings]
    )

    const form = useForm({
        defaultValues: {
            costingId: "",
        },
        onSubmit: async ({ value }) => {
            updateCosting.mutate(
                { id: value.costingId, costing: { sellingId } },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["sellings", sellingId] })
                        setOpen(false)
                        form.reset()
                    },
                }
            )
        },
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <IconPlus className="mr-1 size-4" />
                    Add Costing
                </Button>
            </DialogTrigger>
            <DialogContent
                onInteractOutside={(e) => {
                    const target = e.target as Element
                    if (target.closest('[data-slot="combobox-content"]')) {
                        e.preventDefault()
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Link Costing to Selling</DialogTitle>
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
                            name="costingId"
                            validators={{
                                onChange: zodOnChange(costingSelectionSchema),
                            }}
                        >
                            {(field) => (
                                <div className="my-5">
                                    <SearchableCombobox
                                        id={field.name}
                                        label="Costing"
                                        value={field.state.value}
                                        onValueChange={(nextValue) => field.handleChange(nextValue)}
                                        items={costingItems}
                                        error={fieldError(field.state.meta.errors)}
                                        required
                                        isLoading={isLoading}
                                        placeholder="Search costing number or description..."
                                        emptyMessage="No unlinked costings found."
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={updateCosting.isPending}>
                            {updateCosting.isPending ? "Linking..." : "Link Costing"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
