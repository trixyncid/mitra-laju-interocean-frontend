"use client"

import type { ReactNode } from "react"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useChangePassword, useUpdateProfile } from "@/hooks/use-profile"
import type { User } from "@/app/dashboard/users/columns"
import { buildUserUpdatePayload } from "@/lib/user-update"
import { toast } from "sonner"

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

export default function ProfileForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    onSubmit: async ({ value }) => {
      const payload = buildUserUpdatePayload(user, {
        name: value.name,
        email: value.email,
      })
      if (!payload) {
        toast.info("No changes to save")
        return
      }
      updateProfile.mutate({ id: user.id, user: payload })
    },
  })

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      changePassword.mutate(
        {
          id: user.id,
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        },
        {
          onSuccess: () => {
            passwordForm.reset()
          },
        }
      )
    },
  })

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div>
          <h2 className="text-headline-md font-semibold">Profile information</h2>
          <p className="text-sm text-muted-foreground">Update your name and email address.</p>
        </div>
        <form
          className="max-w-md space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            profileForm.handleSubmit()
          }}
        >
          <profileForm.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value.trim() ? "Name is required" : undefined),
            }}
          >
            {(field) => (
              <FormField label="Name" field={field}>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </profileForm.Field>

          <profileForm.Field
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
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </profileForm.Field>

          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </section>

      <Separator />

      <section className="space-y-6">
        <div>
          <h2 className="text-headline-md font-semibold">Change password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your current password before setting a new one.
          </p>
        </div>

        <form
          className="max-w-md space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            passwordForm.handleSubmit()
          }}
        >
          <passwordForm.Field
            name="currentPassword"
            validators={{
              onChange: ({ value }) => (!value ? "Current password is required" : undefined),
            }}
          >
            {(field) => (
              <FormField label="Current password" field={field}>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </passwordForm.Field>

          <passwordForm.Field
            name="newPassword"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "New password is required"
                if (value.length < 8) return "Password must be at least 8 characters"
                return undefined
              },
            }}
          >
            {(field) => (
              <FormField label="New password" field={field}>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </passwordForm.Field>

          <passwordForm.Field
            name="confirmPassword"
            validators={{
              onChange: ({ value, fieldApi }) => {
                if (!value) return "Please confirm your new password"
                const newPassword = fieldApi.form.getFieldValue("newPassword")
                if (value !== newPassword) return "Passwords do not match"
                return undefined
              },
            }}
          >
            {(field) => (
              <FormField label="Confirm new password" field={field}>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          </passwordForm.Field>

          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Updating..." : "Change password"}
          </Button>
        </form>
      </section>
    </div>
  )
}
