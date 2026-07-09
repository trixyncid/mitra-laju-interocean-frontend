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
import { Textarea } from "@/components/ui/textarea"

type TextFieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  label: string
  id?: string
  error?: string
  description?: string
  required?: boolean
  multiline?: boolean
  trailing?: React.ReactNode
  containerClassName?: string
  ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>
}

function TextField({
  label,
  id,
  error,
  description,
  required,
  multiline,
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
  const controlledValue =
    value === undefined || value === null ? "" : value
  const sharedProps = {
    id: inputId,
    name,
    "aria-invalid": hasError || undefined,
    "aria-required": required || undefined,
    required,
    className: cn(containerClassName, className),
    ...inputProps,
  }

  const renderInput = () => {
    if (multiline) {
      const { fieldSize: _fieldSize, ...textareaProps } = inputProps
      return (
        <Textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...(textareaProps as React.ComponentProps<typeof Textarea>)}
          id={inputId}
          name={name}
          aria-invalid={hasError || undefined}
          aria-required={required || undefined}
          required={required}
          className={cn(containerClassName, className)}
          value={controlledValue}
        />
      )
    }

    const inputElement = (
      <Input
        ref={ref as React.Ref<HTMLInputElement>}
        type={type}
        {...(isFileInput ? {} : { value: controlledValue })}
        {...sharedProps}
        className={cn(trailing ? "pr-11" : sharedProps.className)}
      />
    )

    if (!trailing) {
      return inputElement
    }

    return (
      <div className={cn("relative w-full", containerClassName)}>
        {inputElement}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="pointer-events-auto">{trailing}</div>
        </div>
      </div>
    )
  }

  return (
    <Field data-invalid={hasError || undefined}>
      <FieldLabel htmlFor={inputId} className="cursor-default" required={required}>
        {label}
      </FieldLabel>
      <FieldContent>
        {renderInput()}
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
