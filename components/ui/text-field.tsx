"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TextFieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  label: string
  id?: string
  error?: string
  description?: string
  trailing?: React.ReactNode
  containerClassName?: string
  ref?: React.Ref<HTMLInputElement>
}

function TextField({
  label,
  id,
  error,
  description,
  trailing,
  className,
  containerClassName,
  name,
  ref,
  type,
  value,
  "aria-invalid": ariaInvalid,
  ...inputProps
}: TextFieldProps) {
  const inputId = id ?? name
  const hasError = Boolean(error) || ariaInvalid
  const isFileInput = type === "file"
  // File inputs stay uncontrolled. Text inputs must never flip
  // from undefined → defined (React controlled warning).
  const controlledProps = isFileInput
    ? {}
    : { value: value === undefined || value === null ? "" : value }

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={inputId} className="cursor-default">
        {label}
      </FieldLabel>
      <FieldContent>
        {trailing ? (
          <div className={cn("relative w-full", containerClassName)}>
            <Input
              ref={ref}
              id={inputId}
              name={name}
              type={type}
              {...controlledProps}
              aria-invalid={hasError || undefined}
              className={cn("pr-11", className)}
              {...inputProps}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="pointer-events-auto">{trailing}</div>
            </div>
          </div>
        ) : (
          <Input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            {...controlledProps}
            aria-invalid={hasError || undefined}
            className={cn(containerClassName, className)}
            {...inputProps}
          />
        )}
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

export { TextField }
