"use client"

import type { ReactNode } from "react"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import type { User } from "@/app/dashboard/users/columns"
import { USER_ROLES, formatRoleLabel, type UserRole } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TextField } from "@/components/ui/text-field"
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
import { fieldError } from "@/lib/form-field"
import { userEmailSchema, userNameSchema } from "@/lib/schemas/user"
import {
  matchPasswordField,
  passwordWithConfirmRevalidate,
  zodOnChange,
} from "@/lib/zod-form"
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
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
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
  const router = useRouter()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm({
    defaultValues: {
      id: user?.id ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      confirmPassword: "",
      role: (user?.role ?? "viewer") as UserRole,
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
          },
          {
            onSuccess: (data) => {
              router.push(`/dashboard/users/${data.id}`)
            },
          }
        )
      } else if (user) {
        const payload = buildUserUpdatePayload(user, {
          name: value.name,
          email: value.email,
          role: value.role,
          isActive: value.isActive,
        })
        if (!payload) {
          toast.info("No changes to save")
          return
        }
        updateUser.mutate({ id: value.id, user: payload })
      }
    },
  })

  const isPending = mode === "create" ? createUser.isPending : updateUser.isPending

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-md font-semibold">
          {mode === "create" ? "Staff details" : "Edit staff details"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "Set up a new staff account with name, email, role, and initial password."
            : "Update account information, role, and active status."}
        </p>
      </div>

      <form
        className="max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="name"
          validators={{
            onChange: zodOnChange(userNameSchema),
          }}
        >
          {(field) => (
            <TextField
              label="Name"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: zodOnChange(userEmailSchema),
          }}
        >
          {(field) => (
            <TextField
              label="Email"
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>

        {mode === "create" ? (
          <>
            <form.Field
              name="password"
              validators={{
                onChange: passwordWithConfirmRevalidate("confirmPassword"),
              }}
            >
              {(field) => (
                <TextField
                  label="Initial password"
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
            <form.Field
              name="confirmPassword"
              validators={{
                onChange: matchPasswordField("password", {
                  emptyMessage: "Please confirm the password",
                  mismatchMessage: "Passwords do not match",
                }),
              }}
            >
              {(field) => (
                <TextField
                  label="Confirm password"
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
          </>
        ) : null}

        <form.Field name="role">
          {(field) => (
            <FormField label="Role" field={field}>
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
                      {formatRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </form.Field>

        {mode === "edit" ? (
          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center gap-3">
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

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {mode === "edit"
              ? isPending
                ? "Saving..."
                : "Save changes"
              : isPending
                ? "Creating..."
                : "Create staff"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/users")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
