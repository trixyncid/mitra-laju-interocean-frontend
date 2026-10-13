"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { IconEye, IconEyeOff } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/text-field"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function ProfileDetailsForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile()

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

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
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
            required
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
            required
            id={field.name}
            name={field.name}
            type="email"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={fieldError(field.state.meta.errors)}
            description="You sign in with this email."
          />
        )}
      </profileForm.Field>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save my details"}
        </Button>
      </div>
    </form>
  )
}

/** 0 to 4, from the length and the mix of characters. */
export function passwordScore(password: string) {
  if (password.length < 8) return 0
  let score = 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1
  return Math.min(score, 4)
}

const STRENGTH = [
  { label: "Too short", tone: "bg-[var(--mli-on-error-container)]", text: "text-[var(--mli-on-error-container)]" },
  { label: "Weak", tone: "bg-[var(--mli-on-warning-container)]", text: "text-[var(--mli-on-warning-container)]" },
  { label: "Okay", tone: "bg-[var(--mli-on-warning-container)]", text: "text-[var(--mli-on-warning-container)]" },
  { label: "Good", tone: "bg-[var(--mli-on-success-container)]", text: "text-[var(--mli-on-success-container)]" },
  { label: "Strong", tone: "bg-[var(--mli-on-success-container)]", text: "text-[var(--mli-on-success-container)]" },
]

function StrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const score = passwordScore(password)
  const level = STRENGTH[score]
  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn("h-1.5 rounded-full", step <= Math.max(score, 1) ? level.tone : "bg-muted")}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", level.text)}>Password strength: {level.label}</p>
    </div>
  )
}

function ShowToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label={shown ? "Hide passwords" : "Show passwords"}
      title={shown ? "Hide" : "Show"}
    >
      {shown ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
    </button>
  )
}

export function ProfilePasswordForm({ user }: { user: User }) {
  const changePassword = useChangePassword()
  const [shown, setShown] = useState(false)
  const toggle = <ShowToggle shown={shown} onToggle={() => setShown((value) => !value)} />
  const type = shown ? "text" : "password"

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
            required
            id={field.name}
            name={field.name}
            type={type}
            autoComplete="current-password"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={fieldError(field.state.meta.errors)}
            trailing={toggle}
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
          <div className="space-y-2">
            <TextField
              label="New password"
              required
              id={field.name}
              name={field.name}
              type={type}
              autoComplete="new-password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field.state.meta.errors)}
              trailing={toggle}
            />
            <StrengthMeter password={field.state.value} />
          </div>
        )}
      </passwordForm.Field>

      <passwordForm.Field
        name="confirmPassword"
        validators={{
          onChange: matchPasswordField("newPassword", {
            emptyMessage: "Please type your new password again",
            mismatchMessage: "The two passwords are not the same",
          }),
        }}
      >
        {(field) => (
          <TextField
            label="Type the new password again"
            required
            id={field.name}
            name={field.name}
            type={type}
            autoComplete="new-password"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            error={fieldError(field.state.meta.errors)}
            trailing={toggle}
          />
        )}
      </passwordForm.Field>

      <Button type="submit" disabled={changePassword.isPending}>
        {changePassword.isPending ? "Changing..." : "Change password"}
      </Button>
    </form>
  )
}
