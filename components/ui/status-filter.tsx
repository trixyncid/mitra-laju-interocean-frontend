"use client"

import { Check } from "lucide-react"

import { FilterChip, FilterChipButton } from "@/components/ui/filter-chip"
import {
  PaymentStatusChip,
  StatusChip,
} from "@/components/ui/status-chip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { glassMenu } from "@/lib/design"
import type { FilterOption } from "@/lib/data-table-filters"
import { cn } from "@/lib/utils"

function FilterOptionVisual({ option }: { option: FilterOption }) {
  if (option.value === "true") return <StatusChip active />
  if (option.value === "false") return <StatusChip active={false} />
  if (option.value === "PAID") return <PaymentStatusChip paid />
  if (option.value === "UNPAID") return <PaymentStatusChip paid={false} />
  return <span>{option.label}</span>
}

export function StatusFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)
  const isActive = value !== "all"

  return (
    <FilterChip
      active={isActive}
      onClear={() => onChange("all")}
      clearLabel={`Clear ${label} filter`}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <FilterChipButton
            label={label}
            value={selected?.label ?? "All"}
            muted={!isActive}
            aria-label={label}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(glassMenu, "min-w-[13rem] p-1")}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <DropdownMenuItem
                key={option.value}
                className="cursor-pointer gap-2 rounded-md py-2"
                onSelect={() => onChange(option.value)}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0 text-[var(--mli-primary-container)]",
                    isSelected ? "opacity-100" : "opacity-0"
                  )}
                />
                <FilterOptionVisual option={option} />
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </FilterChip>
  )
}
