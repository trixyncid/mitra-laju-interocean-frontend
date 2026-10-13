"use client"

import { IconCircleCheck, IconId } from "@tabler/icons-react"

import { initialsOf, tintFor } from "@/components/admin/person-avatar"
import { cn } from "@/lib/utils"
import type { UserPreview } from "@/components/forms/user-form"

const TIPS = [
  "Use the email they read every day. They sign in with it.",
  "Pick the role that matches their job. You can change it later.",
  "Send the first password in a private chat or by phone.",
]

/** A live staff card that fills in as the new person is typed. */
export function AccessBadgePreview({ name, email, roleLabel }: UserPreview) {
  const shownName = name.trim() || "New person"

  return (
    <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Preview">
      <p className="text-xs font-medium text-muted-foreground">Preview</p>
      <div className="surface-raised overflow-hidden rounded-3xl">
        <div className="brand-fill relative flex items-center justify-between px-5 py-4">
          <span className="text-xs font-semibold tracking-wide">Mitra Laju Interocean</span>
          <IconId className="size-5 opacity-80" />
        </div>
        <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-6 text-center">
          <span
            className={cn(
              "flex size-20 items-center justify-center rounded-full text-2xl font-semibold ring-4 ring-card shadow-[var(--mli-elev-2)]",
              name.trim() ? tintFor(name) : "bg-muted text-muted-foreground"
            )}
          >
            {name.trim() ? initialsOf(name) : "?"}
          </span>
          <div className="min-w-0 max-w-full">
            <p className={cn("truncate text-lg font-semibold", name.trim() ? "text-foreground" : "text-muted-foreground")}>
              {shownName}
            </p>
            <p className="truncate text-sm text-muted-foreground">{email.trim() || "email@company.com"}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              roleLabel ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {roleLabel || "No role yet"}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--mli-on-success-container)]">
            <IconCircleCheck className="size-4" />
            Can sign in after you add them
          </span>
        </div>
      </div>
      <ul className="space-y-2 px-1">
        {TIPS.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm text-muted-foreground">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50" />
            {tip}
          </li>
        ))}
      </ul>
    </aside>
  )
}
