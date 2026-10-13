"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

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

/** Light pagination for the card and board layouts on the reference pages. */
export function ReferencePager({
  page,
  pageSize,
  totalPages,
  total,
  noun,
  pageSizes = [10, 20, 30, 50, 100],
  onPageChange,
  onPageSizeChange,
  className,
}: {
  page: number
  pageSize: number
  totalPages: number
  total: number
  noun: string
  pageSizes?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  className?: string
}) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)
  const sizes = pageSizes.includes(pageSize) ? pageSizes : [...pageSizes, pageSize].sort((a, b) => a - b)

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground",
        className
      )}
    >
      <p>
        {total === 0 ? (
          `No ${noun}`
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{first}–{last}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> {noun}
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger
            size="sm"
            aria-label="Items per page"
            className={cn(glassControl, "h-8 min-w-[6.5rem] gap-1 rounded-full py-0 pl-3 pr-7 text-xs")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {sizes.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {totalPages > 1 ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <IconChevronLeft />
            </Button>
            <span className="min-w-16 text-center text-xs font-medium text-foreground">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <IconChevronRight />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
