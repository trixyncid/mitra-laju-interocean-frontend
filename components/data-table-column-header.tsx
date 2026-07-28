"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-sm font-medium", className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 cursor-pointer gap-1.5 px-3 font-medium hover:bg-[rgba(247,249,251,0.7)]",
        className
      )}
      onClick={() => column.toggleSorting()}
      aria-label={
        sorted === "asc"
          ? `Sorted ascending. Click to sort descending.`
          : sorted === "desc"
            ? `Sorted descending. Click to clear sort.`
            : `Not sorted. Click to sort ascending.`
      }
    >
      <span>{title}</span>
      {sorted === "desc" ? (
        <ArrowDown className="size-3.5 shrink-0" aria-hidden />
      ) : sorted === "asc" ? (
        <ArrowUp className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      )}
    </Button>
  )
}
