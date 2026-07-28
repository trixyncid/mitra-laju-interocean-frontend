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
import { useCustomerById } from "@/hooks/use-customers"
import { useCustomerSearch } from "@/hooks/use-customer-search"
import { comboboxFieldClassName } from "@/lib/combobox-field-styles"
import { cn } from "@/lib/utils"
import {
  buildCustomerOptions,
  findCustomerOption,
  type CustomerOption,
} from "@/services/customer-options.service"

type CustomerComboboxProps = {
  id?: string
  label?: string
  value: string
  onValueChange: (value: string) => void
  error?: string
  description?: string
  required?: boolean
  placeholder?: string
  enabled?: boolean
}

function filterCustomerOptions(items: CustomerOption[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return items

  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(normalizedQuery) ||
      item.customerCode.toLowerCase().includes(normalizedQuery) ||
      item.customerName.toLowerCase().includes(normalizedQuery)
  )
}

export function CustomerCombobox({
  id,
  label = "Customer Code",
  value,
  onValueChange,
  error,
  description,
  required,
  placeholder = "Search customer code or name...",
  enabled = true,
}: CustomerComboboxProps) {
  const anchor = useComboboxAnchor()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const { data: selectedCustomer, isLoading: isLoadingSelected } = useCustomerById(value)
  const {
    data: searchResults,
    isLoading: isSearching,
    isFetching,
    isError,
  } = useCustomerSearch(searchTerm, enabled && open)

  const items = useMemo(
    () => buildCustomerOptions(searchResults?.items ?? [], selectedCustomer),
    [searchResults?.items, selectedCustomer]
  )

  const selectedItem = useMemo(
    () => findCustomerOption(items, value, selectedCustomer),
    [items, value, selectedCustomer]
  )

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items
    return filterCustomerOptions(items, searchTerm)
  }, [items, searchTerm])

  const isLoading = (isLoadingSelected && Boolean(value)) || (isSearching && !searchResults)

  useEffect(() => {
    if (!open) {
      setInputValue(selectedItem?.label ?? "")
      setSearchTerm("")
    }
  }, [open, selectedItem, value])

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
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen)
            if (nextOpen) {
              setSearchTerm("")
              setInputValue("")
              return
            }
            setInputValue(selectedItem?.label ?? "")
            setSearchTerm("")
          }}
          value={selectedItem}
          inputValue={inputValue}
          onInputValueChange={(nextValue) => {
            setInputValue(nextValue)
            setSearchTerm(nextValue)
            if (!nextValue.trim()) {
              onValueChange("")
            }
          }}
          onValueChange={(item) => {
            const nextValue = item?.value ?? ""
            onValueChange(nextValue)
            setInputValue(item?.label ?? "")
            setSearchTerm("")
          }}
          itemToStringLabel={(item) => item?.label ?? ""}
          isItemEqualToValue={(a, b) => (a?.value ?? "") === (b?.value ?? "")}
        >
          <div ref={anchor} className="w-full">
            <ComboboxInput
              id={id}
              showTrigger
              disabled={!enabled}
              placeholder={
                isLoading ? "Loading customers..." : placeholder
              }
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
              {isError
                ? "Unable to load customers."
                : isFetching
                  ? "Searching..."
                  : "No customers found."}
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
            Customer list could not be loaded. Your saved selection is still kept.
          </FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  )
}
