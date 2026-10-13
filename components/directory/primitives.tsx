"use client"

import type { ComponentType, ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { glassControl } from "@/lib/design"
import { cn } from "@/lib/utils"

/** Soft colour pairs drawn from the shipment/status palette. */
const TINTS = [
  "bg-[var(--mli-export-container)] text-[var(--mli-on-export-container)]",
  "bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)]",
  "bg-[var(--mli-domestic-container)] text-[var(--mli-on-domestic-container)]",
  "bg-[var(--mli-backup-container)] text-[var(--mli-on-backup-container)]",
  "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]",
  "bg-[var(--mli-draft-container)] text-[var(--mli-on-draft-container)]",
] as const

/** The same name always gets the same colour, so people learn to spot it. */
export function tintFor(seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return TINTS[Math.abs(hash) % TINTS.length]
}

const LEGAL_PREFIXES = new Set(["PT", "CV", "UD", "PD", "TBK", "PT.", "CV."])

/** "PT Sinar Mas Agro" → "SM". Company prefixes are skipped. */
export function initialsOf(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word && !LEGAL_PREFIXES.has(word.toUpperCase()))
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function Monogram({
  name,
  shape = "circle",
  className,
}: {
  name: string
  shape?: "circle" | "square"
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center text-sm font-semibold tracking-tight",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        name.trim() ? tintFor(name) : "bg-muted text-muted-foreground",
        className
      )}
    >
      {name.trim() ? initialsOf(name) : "?"}
    </span>
  )
}

export function ViewToggle<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string; icon: ComponentType<{ className?: string }> }[]
  onChange: (next: T) => void
  label: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full surface p-1"
    >
      {options.map((option) => {
        const active = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
              active
                ? "brand-fill text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function DirectoryPager({
  page,
  pageSize,
  totalPages,
  totalRows,
  noun,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  noun: string
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const first = totalRows === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalRows)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground tabular-nums">{first}–{last}</span> of{" "}
        <span className="font-medium text-foreground tabular-nums">{totalRows}</span> {noun}
      </p>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger
            size="sm"
            aria-label="Items per page"
            className={cn(glassControl, "h-8 gap-1 rounded-full py-0 pr-7 pl-3")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[...new Set([12, 24, 48, pageSize])].sort((a, b) => a - b).map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className={cn(glassControl, "size-8")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <span className="sr-only">Previous page</span>
          <ChevronLeft />
        </Button>
        <span className="min-w-16 text-center text-sm font-medium tabular-nums">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className={cn(glassControl, "size-8")}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="sr-only">Next page</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

/** A number tile that can also work as a filter button. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  active = false,
  onClick,
  accent,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ComponentType<{ className?: string }>
  active?: boolean
  onClick?: () => void
  accent?: string
  className?: string
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon ? (
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full",
              accent ?? "bg-secondary text-secondary-foreground"
            )}
          >
            <Icon className="size-3.5" />
          </span>
        ) : null}
      </div>
      <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </span>
      {hint ? <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span> : null}
    </>
  )

  const base = cn(
    "relative rounded-2xl p-4 text-left transition-[box-shadow,transform,background-color]",
    active ? "bg-card ring-2 ring-primary shadow-elev-2" : "surface",
    className
  )

  if (!onClick) return <div className={base}>{body}</div>

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(base, "cursor-pointer hover:-translate-y-0.5 hover:shadow-elev-2")}
    >
      {body}
    </button>
  )
}

export function updatedByName(updatedBy: { name?: string } | string | null | undefined) {
  if (!updatedBy) return undefined
  return typeof updatedBy === "string" ? updatedBy : updatedBy.name
}
