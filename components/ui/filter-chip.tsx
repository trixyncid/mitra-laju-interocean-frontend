"use client"

import { ChevronDown, X } from "lucide-react"
import type { ComponentProps, ReactNode, Ref } from "react"

import { glassControl } from "@/lib/design"
import { cn } from "@/lib/utils"

export function FilterChip({
  active = false,
  onClear,
  clearLabel = "Clear filter",
  className,
  children,
}: {
  active?: boolean
  onClear?: () => void
  clearLabel?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        glassControl,
        "flex h-11 min-w-0 items-center border",
        active &&
          "border-[var(--mli-primary-container)]/40 bg-[rgba(247,249,251,0.92)]",
        className
      )}
    >
      {children}
      {active && onClear ? (
        <button
          type="button"
          className="mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[rgba(232,238,246,0.95)] hover:text-foreground"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onClear()
          }}
          aria-label={clearLabel}
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}

export function FilterChipButton({
  label,
  value,
  muted = false,
  className,
  ref,
  ...props
}: ComponentProps<"button"> & {
  label: string
  value: string
  muted?: boolean
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-11 min-w-0 cursor-pointer items-center gap-2 bg-transparent px-3 text-left text-sm text-foreground outline-none",
        "hover:bg-transparent focus-visible:ring-[3px] focus-visible:ring-ring/20",
        "data-[state=open]:bg-[rgba(232,238,246,0.55)]",
        className
      )}
      {...props}
    >
      <span className="shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[var(--mli-primary-container)]/70 uppercase">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 truncate",
          muted ? "font-normal text-muted-foreground" : "font-medium"
        )}
      >
        {value}
      </span>
      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/80" />
    </button>
  )
}
