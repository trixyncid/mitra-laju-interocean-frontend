"use client"

import { useForm } from "@tanstack/react-form"
import { Button } from "../ui/button"
import { IconLink } from "@tabler/icons-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export default function LinkCostingForm({
    shipmentOrderNumber,
}: {
    shipmentOrderNumber: string | undefined
}) {
    const form = useForm({
        defaultValues: {
            shipmentOrderNumber: shipmentOrderNumber ?? "",
        },
        onSubmit: async ({ value }) => {
            console.log(value)
        }
    })

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <IconLink />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Link Costing</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field name="shipmentOrderNumber" validators={{ onChange: ({ value }) => !value ? "Shipment Order Number is required" : undefined }}>
                                {( field ) => (
                                    <div className="my-5">
                                        <Label htmlFor={field.name} className="my-2">Shipment Order Number</Label>
                                        <Select
                                            value={field.state.value}
                                            onValueChange={(value) => field.handleChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a shipment order number" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Shipment Order Number 1</SelectItem>
                                                <SelectItem value="2">Shipment Order Number 2</SelectItem>
                                                <SelectItem value="3">Shipment Order Number 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </form.Field>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Link Costing</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}