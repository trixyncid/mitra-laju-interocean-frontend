"use client"

import Link from "next/link"
import { IconArrowLeft, IconCrown, IconShieldLock } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn, localDate } from "@/lib/utils"
import type { Role } from "@/services/roles.service"

const STEPS = [
  { title: "Name the role", text: "Use a name people know, like Sales staff." },
  { title: "Choose the pages", text: "Pick a level for each page: view, add & edit, or full." },
  { title: "Give it to people", text: "On the Team page, open a person and choose this role." },
]

/** Header for the new-role and edit-role pages. */
export function RolePageHero({ role }: { role?: Role }) {
  const isSystem = role?.isSystem ?? false

  return (
    <header className="surface relative mb-6 overflow-hidden rounded-3xl lg:mb-8">
      <div className="brand-fill relative px-5 pt-4 pb-10 sm:px-7 sm:pt-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.18),transparent_55%)]"
        />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="relative -ml-2 text-primary-foreground/85 hover:bg-white/10 hover:text-primary-foreground"
        >
          <Link href="/dashboard/roles">
            <IconArrowLeft className="size-4" />
            All roles
          </Link>
        </Button>
      </div>
      <div className="relative px-5 pb-6 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {/* Only the badge overlaps the band; the text sits below it. */}
            <span
              className={cn(
                "relative z-10 -mt-8 flex size-16 shrink-0 items-center justify-center rounded-2xl bg-card text-primary shadow-[var(--mli-highlight),var(--mli-elev-2)]"
              )}
            >
              {isSystem ? <IconCrown className="size-8" /> : <IconShieldLock className="size-8" />}
            </span>
            <div className="min-w-0 pt-3">
              <h1 className="truncate text-headline-lg">{role ? role.name : "New role"}</h1>
              <p className="text-sm text-muted-foreground">
                {role ? (
                  <>
                    <span className="font-mono">{role.slug}</span> · {isSystem ? "System role" : "Custom role"}
                  </>
                ) : (
                  "Choose what this group of people can do."
                )}
              </p>
            </div>
          </div>
          {role ? (
            <dl className="flex gap-6 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">People</dt>
                <dd className="font-semibold tabular-nums text-foreground">{role._count?.users ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last changed</dt>
                <dd className="font-semibold text-foreground">{localDate(role.updatedAt)}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        {role ? (
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            {isSystem
              ? "This is a system role. It can always do everything. You can only change its name and description."
              : "Changes apply to everyone with this role the next time they open a page."}
          </p>
        ) : (
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="surface-inset flex gap-3 rounded-xl p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{step.title}</span>
                  <span className="block text-xs text-muted-foreground">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </header>
  )
}
