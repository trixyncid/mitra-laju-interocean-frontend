import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function ShipmentContainerForm({
    mode,
    containerNumber,
    sealNumber,
    isActive
}: {
    mode: "edit" | "create",
    containerNumber: string | undefined,
    sealNumber: string | undefined,
    isActive: boolean | undefined
}) {

    const form = useForm({
        defaultValues: {
            containerNumber: containerNumber ?? "",
            sealNumber: sealNumber ?? "",
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
                    <Button>{ mode === "edit" ? <IconEdit /> : <><IconPlus /> Add Container</>}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{mode === "edit" ? "Edit Shipment Container": "Create New Shipment Container"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}>
                        <div>
                            <form.Field 
                                name="containerNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Container Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Container Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            <form.Field 
                                name="sealNumber"
                                validators={{
                                    onChange: ({ value }) =>
                                        !value ? "Seal Number is required" : undefined,
                                }}
                            >
                                {( field ) => (
                                    <div className="my-3">
                                        <Label htmlFor={field.name} className="my-2">Seal Number</Label>
                                        <Input id={field.name} name={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                        {
                                            field.state.meta.errors ? (
                                                <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                                            ) : null
                                        }
                                    </div>
                                )}
                            </form.Field>
                            { mode === "edit" ? <form.Field name="isActive">
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