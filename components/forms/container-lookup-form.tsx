"use client"

import { ActiveStatusField } from "@/components/forms/active-status-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TextField } from "@/components/ui/text-field"
import { fieldError } from "@/lib/form-field"
import { containerLookupNameSchema } from "@/lib/schemas/container-lookup"
import { zodOnChange } from "@/lib/zod-form"
import { IconPlus } from "@tabler/icons-react"
import { useForm } from "@tanstack/react-form"
import {
  useCreateContainerLookup,
  useUpdateContainerLookup,
} from "@/hooks/use-container-lookups"
import { useState } from "react"
import { Pencil } from "lucide-react"
import type { ContainerLookupKind } from "@/services/container-lookups.service"

export default function ContainerLookupForm({
  kind,
  mode,
  name,
  isActive,
  id,
}: {
  kind: ContainerLookupKind
  mode: "edit" | "create"
  name: string | undefined
  isActive: boolean | undefined
  id: string | undefined
}) {
  const [open, setOpen] = useState(false)
  const createLookup = useCreateContainerLookup(kind)
  const updateLookup = useUpdateContainerLookup(kind)
  const entityLabel = kind === "size" ? "Size" : "Type"

  const form = useForm({
    defaultValues: {
      id: id ?? "",
      name: name ?? "",
      isActive: isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createLookup.mutate(
          {
            name: value.name,
          },
          {
            onSuccess: () => {
              setOpen(false)
              form.reset()
            },
          }
        )
      } else {
        updateLookup.mutate(
          {
            id: value.id,
            payload: {
              name: value.name,
              isActive: value.isActive,
            },
          },
          {
            onSuccess: () => {
              setOpen(false)
              form.reset()
            },
          }
        )
      }
    },
  })

  const isPending = mode === "create" ? createLookup.isPending : updateLookup.isPending

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {mode === "edit" ? (
            <Button variant="outline" size="icon">
              <Pencil />
            </Button>
          ) : (
            <Button>
              <IconPlus /> Add {entityLabel}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? `Edit Container ${entityLabel}` : `Create Container ${entityLabel}`}
            </DialogTitle>
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
                name="name"
                validators={{ onChange: zodOnChange(containerLookupNameSchema) }}
              >
                {(field) => (
                  <div className="my-3">
                    <TextField
                      label="Name"
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
              {mode === "edit" ? (
                <form.Field name="isActive">
                  {(field) => (
                    <div className="my-3">
                      <ActiveStatusField
                        id={field.name}
                        value={field.state.value === true}
                        onChange={(checked) => field.handleChange(checked)}
                        description={
                          kind === "size"
                            ? "Inactive sizes stay in history but are hidden when adding new shipment containers."
                            : "Inactive types stay in history but are hidden when adding new shipment containers."
                        }
                      />
                    </div>
                  )}
                </form.Field>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {mode === "edit"
                  ? updateLookup.isPending
                    ? "Updating..."
                    : "Save Changes"
                  : createLookup.isPending
                    ? "Creating..."
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
