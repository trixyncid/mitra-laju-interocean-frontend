"use client"

import { useState } from "react"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { inputVariants } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  formatSingleDateLabel,
  parseLocalDate,
  toIsoDateOnly,
  toStoredIsoDate,
} from "@/lib/date-input"
import { cn } from "@/lib/utils"

export type DatePickerOutputFormat = "iso" | "date-only"

type DatePickerProps = {
  id?: string
  label: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  description?: string
  required?: boolean
  placeholder?: string
  clearable?: boolean
  outputFormat?: DatePickerOutputFormat
  className?: string
}

export function DatePicker({
  id,
  label,
  value,
  onValueChange,
  error,
  description,
  required,
  placeholder = "Pick a date",
  clearable = true,
  outputFormat = "iso",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseLocalDate(value)
  const hasValue = Boolean(value)
  const showClear = clearable && hasValue && !required

  function emitChange(date: Date) {
    onValueChange(
      outputFormat === "date-only" ? toIsoDateOnly(date) : toStoredIsoDate(date)
    )
    setOpen(false)
  }

  return (
    <Field data-invalid={Boolean(error) || undefined} className={className}>
      <FieldLabel htmlFor={id} className="cursor-default" required={required}>
        {label}
      </FieldLabel>
      <FieldContent>
        <div className="relative w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                id={id}
                variant="ghost"
                aria-invalid={Boolean(error) || undefined}
                aria-required={required || undefined}
                className={cn(
                  inputVariants({ fieldSize: "default" }),
                  "w-full justify-start border-border bg-card font-normal shadow-none hover:border-input hover:bg-card",
                  showClear && "pr-10",
                  !hasValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">
                  {formatSingleDateLabel(value, placeholder)}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto rounded-lg p-0" align="start">
              <Calendar
                mode="single"
                selected={selected}
                defaultMonth={selected}
                onSelect={(date) => {
                  if (date) {
                    emitChange(date)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {showClear ? (
            <button
              type="button"
              className="absolute top-1/2 right-3 z-10 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onValueChange("")
              }}
              aria-label={`Clear ${label}`}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        {error ? (
          <em
            role="alert"
            className="text-xs not-italic text-[var(--mli-on-error-container)]"
          >
            {error}
          </em>
        ) : description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  )
}
