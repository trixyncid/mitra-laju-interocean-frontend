"use client"

import { useEffect, useMemo, useState } from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { useCountries } from "@/hooks/use-countries"
import { comboboxFieldClassName } from "@/lib/combobox-field-styles"
import { cn } from "@/lib/utils"
import {
  buildCountryOptions,
  findCountryOption,
  type CountryOption,
} from "@/services/countries.service"

type CountryComboboxProps = {
  id?: string
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  description?: string
  required?: boolean
  placeholder?: string
}

function filterCountryOptions(items: CountryOption[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return items

  return items.filter((item) =>
    item.label.toLowerCase().includes(normalizedQuery)
  )
}

export function CountryCombobox({
  id,
  label = "Country",
  value,
  onValueChange,
  error,
  description,
  required,
  placeholder = "Search country...",
}: CountryComboboxProps) {
  const anchor = useComboboxAnchor()
  const { data: countries = [], isLoading, isError } = useCountries()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const items = useMemo(
    () => buildCountryOptions(countries, value),
    [countries, value]
  )

  const selectedItem = useMemo(
    () => findCountryOption(items, value),
    [items, value]
  )

  const filteredItems = useMemo(
    () => filterCountryOptions(items, inputValue),
    [items, inputValue]
  )

  useEffect(() => {
    setInputValue(selectedItem?.label ?? value)
  }, [selectedItem, value])

  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor={id} className="cursor-default" required={required}>
        {label}
      </FieldLabel>
      <FieldContent>
        <Combobox
          items={items}
          filteredItems={filteredItems}
          open={open}
          onOpenChange={setOpen}
          value={selectedItem}
          inputValue={inputValue}
          onInputValueChange={(nextValue) => {
            setInputValue(nextValue)
            if (!nextValue.trim()) {
              onValueChange("")
            }
          }}
          onValueChange={(item) => {
            const nextValue = item?.value ?? ""
            onValueChange(nextValue)
            setInputValue(item?.label ?? "")
          }}
          itemToStringLabel={(item) => item.label}
          isItemEqualToValue={(a, b) =>
            a.value.localeCompare(b.value, undefined, { sensitivity: "accent" }) ===
            0
          }
        >
          <div ref={anchor} className="w-full">
            <ComboboxInput
              id={id}
              showTrigger
              disabled={isLoading}
              placeholder={isLoading ? "Loading countries..." : placeholder}
              aria-invalid={Boolean(error) || undefined}
              aria-required={required || undefined}
              className={comboboxFieldClassName(
                cn(
                  "border-border hover:border-input",
                  "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20"
                )
              )}
            />
          </div>
          <ComboboxContent anchor={anchor} className="p-0">
            <ComboboxEmpty>
              {isError ? "Unable to load countries." : "No countries found."}
            </ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {error ? (
          <em
            role="alert"
            className="text-xs not-italic text-[var(--mli-on-error-container)]"
          >
            {error}
          </em>
        ) : description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : isError ? (
          <FieldDescription>
            Country list could not be loaded. Your saved value is still kept.
          </FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  )
}
