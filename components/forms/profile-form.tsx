"use client"

import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/text-field"
import { Separator } from "@/components/ui/separator"
import { useChangePassword, useUpdateProfile } from "@/hooks/use-profile"
import type { User } from "@/app/dashboard/users/columns"
import { buildUserUpdatePayload } from "@/lib/user-update"
import { fieldError } from "@/lib/form-field"
import { currentPasswordSchema } from "@/lib/schemas/common"
import { profileEmailSchema, profileNameSchema } from "@/lib/schemas/user"
import {
  matchPasswordField,
  newPasswordWithConfirmRevalidate,
  zodOnChange,
} from "@/lib/zod-form"
import { toast } from "sonner"

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
              onChange: zodOnChange(profileNameSchema),
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
          </profileForm.Field>

          <profileForm.Field
            name="email"
            validators={{
              onChange: zodOnChange(profileEmailSchema),
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
              onChange: zodOnChange(currentPasswordSchema),
            }}
          >
            {(field) => (
              <TextField
                label="Current password"
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </passwordForm.Field>

          <passwordForm.Field
            name="newPassword"
            validators={{
              onChange: newPasswordWithConfirmRevalidate("confirmPassword"),
            }}
          >
            {(field) => (
              <TextField
                label="New password"
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </passwordForm.Field>

          <passwordForm.Field
            name="confirmPassword"
            validators={{
              onChange: matchPasswordField("newPassword", {
                emptyMessage: "Please confirm your new password",
                mismatchMessage: "Passwords do not match",
              }),
            }}
          >
            {(field) => (
              <TextField
                label="Confirm new password"
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={fieldError(field.state.meta.errors)}
              />
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
