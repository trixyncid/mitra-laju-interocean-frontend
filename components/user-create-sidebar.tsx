"use client"

import { IconShield, IconUserPlus } from "@tabler/icons-react"

export function UserCreateSidebar() {
  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(214,227,255,0.55)] bg-[rgba(232,238,246,0.72)] shadow-[0_8px_32px_rgba(27,54,93,0.07)] backdrop-blur-xl">
      <div className="bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 py-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          New staff member
        </p>
        <h2 className="mt-1 text-xl font-semibold">Create account</h2>
        <p className="mt-2 text-sm text-primary-foreground/80">
          Add a new user to the system with their role and login credentials.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconUserPlus className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              After creation
            </p>
            <p className="text-sm text-muted-foreground">
              You can upload a profile photo and manage the account from the edit page.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
            <IconShield className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
              Password
            </p>
            <p className="text-sm text-muted-foreground">
              Share the initial password securely. The user can change it from their profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
