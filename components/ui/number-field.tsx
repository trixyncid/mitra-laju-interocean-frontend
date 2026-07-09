"use client"

import { useEffect, useState } from "react"

import { TextField } from "@/components/ui/text-field"
import {
  formatNumberFieldDisplay,
  formatNumberInputLive,
  isValidNumberInput,
  parseLocaleNumber,
  sanitizeNumberInput,
} from "@/lib/number-input"

type NumberFieldProps = {
  label: string
  id?: string
  name?: string
  value: number | string
  onValueChange: (value: number | "") => void
  error?: string
  description?: string
  required?: boolean
  placeholder?: string
  useGrouping?: boolean
  maximumFractionDigits?: number
}

export function NumberField({
  label,
  id,
  name,
  value,
  onValueChange,
  error,
  description,
  required,
  placeholder,
  useGrouping = true,
  maximumFractionDigits = 2,
}: NumberFieldProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    formatNumberFieldDisplay(value, { useGrouping, maximumFractionDigits })
  )

  useEffect(() => {
    setDisplayValue(
      formatNumberFieldDisplay(value, { useGrouping, maximumFractionDigits })
    )
  }, [value, useGrouping, maximumFractionDigits])

  return (
    <TextField
      label={label}
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      required={required}
      placeholder={placeholder}
      value={displayValue}
      description={description}
      error={error}
      onChange={(event) => {
        const raw = sanitizeNumberInput(event.target.value)
        if (!isValidNumberInput(raw)) return

        const nextDisplay = useGrouping
          ? formatNumberInputLive(raw, { useGrouping, maximumFractionDigits })
          : raw

        setDisplayValue(nextDisplay)
        const parsed = parseLocaleNumber(raw)
        onValueChange(parsed === "" ? "" : parsed)
      }}
      onBlur={() => {
        const parsed = parseLocaleNumber(displayValue)
        if (parsed === "") {
          setDisplayValue("")
          onValueChange("")
          return
        }

        setDisplayValue(
          formatNumberFieldDisplay(parsed, {
            useGrouping,
            maximumFractionDigits,
          })
        )
        onValueChange(parsed)
      }}
    />
  )
}
