"use client"

import { useState, type ReactNode } from "react"
import { useForm } from "@tanstack/react-form"
import { IconPlus } from "@tabler/icons-react"
import { Pencil } from "lucide-react"

import type { User } from "@/app/dashboard/users/columns"
import { USER_ROLES, type UserRole } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCreateUser, useUpdateUser } from "@/hooks/use-users"
import { buildUserUpdatePayload } from "@/lib/user-update"
import { toast } from "sonner"

const roles = USER_ROLES

function FormField({
  label,
  field,
  children,
}: {
  label: string
  field: { name: string; state: { meta: { errors: unknown[] } } }
  children: ReactNode
}) {
  return (
    <div className="my-3">
      <Label htmlFor={field.name} className="my-2">
        {label}
      </Label>
      {children}
      {field.state.meta.errors.length ? (
        <em className="text-xs text-[var(--mli-on-error-container)]">
          {String(field.state.meta.errors[0])}
        </em>
      ) : null}
    </div>
  )
}

export default function UserForm({
  mode,
  user,
}: {
  mode: "edit" | "create"
  user?: User
}) {
  const [open, setOpen] = useState(false)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm({
    defaultValues: {
      id: user?.id ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: (user?.role ?? "viewer") as UserRole,
      emailVerified: user?.emailVerified ?? false,
      isActive: user?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createUser.mutate(
          {
            name: value.name,
            email: value.email,
            password: value.password,
            role: value.role,
            emailVerified: value.emailVerified,
          },
          {
            onSuccess: () => {
              setOpen(false)
              form.reset()
            },
          }
        )
      } else if (user) {
        const payload = buildUserUpdatePayload(user, {
          name: value.name,
          email: value.email,
          role: value.role,
          emailVerified: value.emailVerified,
          isActive: value.isActive,
        })
        if (!payload) {
          toast.info("No changes to save")
          return
        }
        updateUser.mutate(
          { id: value.id, user: payload },
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

  const isPending = mode === "create" ? createUser.isPending : updateUser.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="outline" size="icon">
            <Pencil />
          </Button>
        ) : (
          <Button>
            <IconPlus /> Add User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value.trim() ? "Name is required" : undefined),
            }}
          >
            {(field) => (
              <FormField label="Name" field={field}>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return "Email is required"
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address"
                return undefined
              },
            }}
          >
            {(field) => (
              <FormField label="Email" field={field}>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </form.Field>

          {mode === "create" ? (
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Password is required"
                  if (value.length < 8) return "Password must be at least 8 characters"
                  return undefined
                },
              }}
            >
              {(field) => (
                <FormField label="Password" field={field}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </FormField>
              )}
            </form.Field>
          ) : null}

          <form.Field name="role">
            {(field) => (
              <div className="my-3">
                <Label htmlFor={field.name} className="my-2">
                  Role
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as UserRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="emailVerified">
            {(field) => (
              <div className="my-3 flex items-center gap-3">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
                <Label htmlFor={field.name}>Email verified</Label>
              </div>
            )}
          </form.Field>

          {mode === "edit" ? (
            <form.Field name="isActive">
              {(field) => (
                <div className="my-3 flex items-center gap-3">
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                  <Label htmlFor={field.name}>Active account</Label>
                </div>
              )}
            </form.Field>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {mode === "edit"
                ? isPending
                  ? "Updating..."
                  : "Save Changes"
                : isPending
                  ? "Creating..."
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
