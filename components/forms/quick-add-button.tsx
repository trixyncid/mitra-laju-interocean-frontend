"use client"

import { IconPlus } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export function QuickAddButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium",
        "text-[var(--mli-primary-container)]",
        "transition-colors hover:bg-[rgba(214,227,255,0.4)]",
        "disabled:pointer-events-none disabled:opacity-40"
      )}
    >
      <IconPlus className="size-4" />
      {label}
    </button>
  )
}
