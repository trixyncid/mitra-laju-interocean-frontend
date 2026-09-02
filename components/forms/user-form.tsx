"use client"

import type { ReactNode } from "react"
import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import type { User } from "@/app/dashboard/users/columns"
import { formatRoleLabel } from "@/lib/permissions"
import { ActiveStatusField } from "@/components/forms/active-status-field"
import { Button } from "@/components/ui/button"
import { FormLabel } from "@/components/ui/form-label"
import { TextField } from "@/components/ui/text-field"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { useCreateUser, useUpdateUser } from "@/hooks/use-users"
import { useRoleSearch } from "@/hooks/use-entity-searches"
import { buildUserUpdatePayload } from "@/lib/user-update"
import { fieldError } from "@/lib/form-field"
import { userEmailSchema, userNameSchema } from "@/lib/schemas/user"
import {
  matchPasswordField,
  passwordWithConfirmRevalidate,
  zodOnChange,
} from "@/lib/zod-form"
import { toast } from "sonner"
import { useMemo, useState } from "react"

function FormField({
  label,
  required,
  field,
  children,
}: {
  label: string
  required?: boolean
  field: { name: string; state: { meta: { errors: unknown[] } } }
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <FormLabel htmlFor={field.name} required={required}>
        {label}
      </FormLabel>
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
  const [roleSearch, setRoleSearch] = useState("")
  const {
    data: rolesPage,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
    isError: rolesError,
  } = useRoleSearch(roleSearch)
  const roleItems = useMemo(
    () =>
      rolesPage?.items.map((role) => ({
        value: role.id,
        label: role.name || formatRoleLabel(role.slug),
      })) ?? [],
    [rolesPage?.items]
  )

  const form = useForm({
    defaultValues: {
      id: user?.id ?? "",
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      confirmPassword: "",
      roleId: user?.roleId ?? user?.roleRef?.id ?? "",
      isActive: user?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      if (!value.roleId) {
        toast.error("Please select a role")
        return
      }
      if (mode === "create") {
        createUser.mutate(
          {
            name: value.name,
            email: value.email,
            password: value.password,
            roleId: value.roleId,
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
          roleId: value.roleId,
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
              required
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
              required
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
                  required
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
                  required
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

        <form.Field name="roleId">
          {(field) => (
            <SearchableCombobox
              id={field.name}
              label="Role"
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
              items={roleItems}
              error={
                field.state.meta.errors[0]
                  ? String(field.state.meta.errors[0])
                  : undefined
              }
              required
              isLoading={rolesLoading}
              isSearching={rolesFetching}
              searchError={rolesError}
              onSearchTermChange={setRoleSearch}
              placeholder="Search role name..."
              emptyMessage="No roles found."
            />
          )}
        </form.Field>

        {mode === "edit" ? (
          <form.Field name="isActive">
            {(field) => (
              <ActiveStatusField
                id={field.name}
                value={field.state.value === true}
                onChange={(checked) => field.handleChange(checked)}
                description="Inactive accounts cannot sign in. Sessions are revoked when deactivated."
              />
            )}
          </form.Field>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isPending || rolesLoading}>
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
