"use client"

import { useState } from "react"
import { IconAlertTriangle, IconListSearch } from "@tabler/icons-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { glassInset } from "@/lib/design"
import {
  EXPORTABLE_MODULES,
  MODULE_LABEL,
  pickerSources,
  type AppModule,
  type ModulePermissionFlags,
} from "@/lib/permissions"
import { cn } from "@/lib/utils"
import type { RolePermission } from "@/services/roles.service"

type Flags = Pick<RolePermission, "canView" | "canCreate" | "canEdit" | "canDelete">

export type AccessLevel = "none" | "view" | "edit" | "full"

/** Level picked for a row: no access also drops Export; opening a page turns it on by default. */
function levelChange(row: RolePermission, level: AccessLevel): Partial<RolePermission> {
  return {
    ...LEVEL_FLAGS[level],
    canExport: level === "none" ? false : row.canView ? row.canExport : true,
  }
}

const LEVELS: { value: AccessLevel; label: string; hint: string }[] = [
  { value: "none", label: "No access", hint: "Cannot open this page" },
  { value: "view", label: "View only", hint: "Can open and read. Cannot change anything." },
  { value: "edit", label: "Add & edit", hint: "Can read, add and change" },
  { value: "full", label: "Full", hint: "Can read, add, change and delete" },
]

const LEVEL_FLAGS: Record<AccessLevel, Flags> = {
  none: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  view: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  edit: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  full: { canView: true, canCreate: true, canEdit: true, canDelete: true },
}

/** The level the flags match exactly, or null for a custom mix. */
export function levelOf(flags: Flags): AccessLevel | null {
  const match = LEVELS.find(({ value }) => {
    const level = LEVEL_FLAGS[value]
    return (
      level.canView === flags.canView &&
      level.canCreate === flags.canCreate &&
      level.canEdit === flags.canEdit &&
      level.canDelete === flags.canDelete
    )
  })
  return match?.value ?? null
}

/** Grouped the way the top menu is, so admins find modules where users do. */
export const ACCESS_GROUPS: { label: string; modules: AppModule[] }[] = [
  { label: "Overview", modules: ["DASHBOARD"] },
  { label: "Operations", modules: ["SHIPMENT"] },
  { label: "Commercial", modules: ["SALES", "VENDOR_INVOICE", "COSTING", "SELLING", "CUSTOMER_INVOICE"] },
  { label: "Master data", modules: ["CUSTOMER", "VENDOR", "PORT", "VESSEL", "CONTAINER", "SERVICE"] },
  { label: "Administration", modules: ["USER", "ROLE"] },
]

const ADVANCED_FLAGS = [
  ["canView", "View"],
  ["canCreate", "Add"],
  ["canEdit", "Edit"],
  ["canDelete", "Delete"],
] as const

function listModules(modules: AppModule[]) {
  return modules.map((m) => MODULE_LABEL[m]).join(", ")
}

function LevelControl({
  module,
  value,
  onChange,
}: {
  module: AppModule
  value: AccessLevel | null
  onChange: (level: AccessLevel) => void
}) {
  const label = MODULE_LABEL[module]
  const focusable = value ?? "none"

  return (
    <div
      role="radiogroup"
      aria-label={`${label} access`}
      className={cn(glassInset, "grid w-full grid-cols-4 gap-1 p-1 sm:w-[23rem]")}
    >
      {LEVELS.map((level, index) => {
        const active = value === level.value
        return (
          <button
            key={level.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={level.hint}
            tabIndex={level.value === focusable ? 0 : -1}
            onClick={() => onChange(level.value)}
            onKeyDown={(event) => {
              const step =
                event.key === "ArrowRight" || event.key === "ArrowDown"
                  ? 1
                  : event.key === "ArrowLeft" || event.key === "ArrowUp"
                    ? -1
                    : 0
              if (!step) return
              event.preventDefault()
              const next = LEVELS[(index + step + LEVELS.length) % LEVELS.length]
              onChange(next.value)
              const group = event.currentTarget.parentElement
              ;(group?.children[LEVELS.indexOf(next)] as HTMLElement | undefined)?.focus()
            }}
            className={cn(
              "h-8 cursor-pointer rounded-md px-1 text-xs font-medium sm:text-[13px] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
              active
                ? level.value === "none"
                  ? "bg-card text-foreground shadow-sm"
                  : "brand-fill text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-[rgba(var(--mli-inset-rgb),0.9)] hover:text-foreground"
            )}
          >
            {level.label}
          </button>
        )
      })}
    </div>
  )
}

function AdvancedControl({
  row,
  onChange,
}: {
  row: RolePermission
  onChange: (flags: Partial<RolePermission>) => void
}) {
  const label = MODULE_LABEL[row.module]
  return (
    <div className="grid w-full grid-cols-4 gap-1 sm:w-[23rem]">
      {ADVANCED_FLAGS.map(([key, text]) => (
        <label
          key={key}
          className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md text-[13px] text-muted-foreground hover:bg-muted"
        >
          <Checkbox
            checked={row[key]}
            aria-label={`${label} ${text}`}
            onCheckedChange={(checked) => {
              const on = checked === true
              // Doing anything on a page needs the page: writes imply View,
              // and removing View removes everything else.
              if (key === "canView" && !on) return onChange({ ...LEVEL_FLAGS.none, canExport: false })
              onChange({ ...row, [key]: on, ...(on && key !== "canView" ? { canView: true } : {}) })
            }}
          />
          {text}
        </label>
      ))}
    </div>
  )
}

/** Excel download for the module's table; needs View, so it is off without it. */
function ExportToggle({ row, onChange }: { row: RolePermission; onChange: (on: boolean) => void }) {
  const exportable = EXPORTABLE_MODULES.includes(row.module)
  // Keep the column aligned on rows without an export.
  if (!exportable) return <span aria-hidden className="hidden w-[4.75rem] shrink-0 sm:block" />
  return (
    <label
      title={row.canView ? "Can download this table as Excel" : "Needs View access first"}
      className={cn(
        "flex h-8 w-[4.75rem] shrink-0 items-center gap-2 rounded-md px-2 text-[13px]",
        row.canView ? "cursor-pointer text-muted-foreground hover:bg-muted" : "cursor-not-allowed text-muted-foreground/50"
      )}
    >
      <Checkbox
        checked={row.canView && row.canExport}
        disabled={!row.canView}
        aria-label={`${MODULE_LABEL[row.module]} Export`}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      Export
    </label>
  )
}

export function ModuleAccessEditor({
  rows,
  onChange,
}: {
  rows: RolePermission[]
  onChange: (module: AppModule, flags: Partial<RolePermission>) => void
}) {
  const [advanced, setAdvanced] = useState(
    () => rows.some((row) => levelOf(row) === null)
  )

  const byModule = new Map(rows.map((row) => [row.module, row]))
  const permissions = Object.fromEntries(rows.map((row) => [row.module, row])) as Partial<
    Record<AppModule, ModulePermissionFlags>
  >

  const pages = rows.filter((row) => row.canView).map((row) => row.module)
  const pickOnly = rows
    .filter((row) => !row.canView && pickerSources(permissions, row.module).length > 0)
    .map((row) => row.module)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h3 className="text-base font-semibold">What can this role do?</h3>
          <p className="text-sm text-muted-foreground">
            Choose a level for each page. If a role can fill in a form, it can also choose items
            from the lists in that form. For example, a role that adds sales jobs can choose a
            customer, even without the Customers page.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={advanced} onCheckedChange={setAdvanced} aria-label="Advanced permissions" />
          Advanced
        </label>
      </div>

      {/* What the role ends up with, before anyone saves it. */}
      <div className={cn(glassInset, "grid gap-4 p-4 sm:grid-cols-2")}>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Pages this role can open</p>
          <p className="mt-1 text-sm text-foreground">
            {pages.length ? listModules(pages) : "None. Users will only see their own profile."}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Can also choose in forms</p>
          <p className="mt-1 text-sm text-foreground">
            {pickOnly.length ? listModules(pickOnly) : "Nothing extra."}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {ACCESS_GROUPS.map((group) => {
          const groupRows = group.modules
            .map((module) => byModule.get(module))
            .filter((row): row is RolePermission => !!row)
          if (groupRows.length === 0) return null
          return (
            <section key={group.label} aria-label={group.label}>
              <h4 className="mb-1.5 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.label}
              </h4>
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
                {groupRows.map((row) => {
                  const level = levelOf(row)
                  const sources = pickerSources(permissions, row.module)
                  const note =
                    row.module === "ROLE"
                      ? { tone: "muted", text: "Only system admins can manage roles." }
                      : !row.canView && sources.length
                        ? { tone: "pick", text: `Can choose in forms (because of ${listModules(sources)})` }
                        : !advanced && level === null
                          ? { tone: "warn", text: "Mixed settings. Turn on Advanced to see them, or choose a level." }
                          : null
                  return (
                    <li
                      key={row.module}
                      className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{MODULE_LABEL[row.module]}</p>
                        {note ? (
                          <p
                            className={cn(
                              "mt-0.5 flex items-center gap-1.5 text-xs",
                              note.tone === "pick" && "text-primary",
                              note.tone === "warn" && "text-[var(--mli-on-warning-container)]",
                              note.tone === "muted" && "text-muted-foreground"
                            )}
                          >
                            {note.tone === "pick" ? <IconListSearch className="size-3.5 shrink-0" /> : null}
                            {note.tone === "warn" ? <IconAlertTriangle className="size-3.5 shrink-0" /> : null}
                            {note.text}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-3">
                        {advanced ? (
                          <AdvancedControl row={row} onChange={(flags) => onChange(row.module, flags)} />
                        ) : (
                          <LevelControl
                            module={row.module}
                            value={level}
                            onChange={(next) => onChange(row.module, levelChange(row, next))}
                          />
                        )}
                        <ExportToggle row={row} onChange={(on) => onChange(row.module, { canExport: on })} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
