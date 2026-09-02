"use client"

import { useEffect, useMemo, useState } from "react"

import { QuickAddButton } from "@/components/forms/quick-add-button"

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
import { comboboxFieldClassName } from "@/lib/combobox-field-styles"
import { cn } from "@/lib/utils"

export type SearchableComboboxOption = {
  value: string
  label: string
}

type SearchableComboboxProps = {
  id?: string
  label: string
  value: string
  onValueChange: (value: string) => void
  items: SearchableComboboxOption[]
  error?: string
  description?: string
  required?: boolean
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  isLoading?: boolean
  quickAddLabel?: string
  onQuickAdd?: () => void
  /** When set, typing triggers server-side search via the parent. */
  onSearchTermChange?: (term: string) => void
  isSearching?: boolean
  searchError?: boolean
}

function ensureSelectedOption(
  items: SearchableComboboxOption[],
  value: string
): SearchableComboboxOption[] {
  if (!value) return items
  if (items.some((item) => item.value === value)) return items
  return [...items, { value, label: value }]
}

function filterOptions(
  items: SearchableComboboxOption[],
  query: string
): SearchableComboboxOption[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return items
  return items.filter((item) =>
    item.label.toLowerCase().includes(normalizedQuery)
  )
}

export function SearchableCombobox({
  id,
  label,
  value,
  onValueChange,
  items,
  error,
  description,
  required,
  placeholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  isLoading = false,
  quickAddLabel = "Add new",
  onQuickAdd,
  onSearchTermChange,
  isSearching = false,
  searchError = false,
}: SearchableComboboxProps) {
  const anchor = useComboboxAnchor()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const asyncSearch = Boolean(onSearchTermChange)

  const options = useMemo(
    () => ensureSelectedOption(items, value),
    [items, value]
  )

  const selectedItem = useMemo(
    () => options.find((item) => item.value === value) ?? null,
    [options, value]
  )

  const displayItems = useMemo(() => {
    if (asyncSearch) return options
    return filterOptions(options, inputValue)
  }, [asyncSearch, options, inputValue])

  useEffect(() => {
    if (!open) {
      setInputValue(selectedItem?.label ?? "")
    }
  }, [open, selectedItem, value])

  const emptyContent = searchError
    ? "Unable to load options."
    : isLoading || isSearching
      ? "Searching..."
      : emptyMessage

  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor={id} className="cursor-default" required={required}>
        {label}
      </FieldLabel>
      <FieldContent>
        <Combobox
          items={options}
          filteredItems={displayItems}
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen)
            if (nextOpen) {
              setInputValue("")
              onSearchTermChange?.("")
              return
            }
            setInputValue(selectedItem?.label ?? "")
          }}
          value={selectedItem}
          inputValue={inputValue}
          onInputValueChange={(nextValue) => {
            setInputValue(nextValue)
            onSearchTermChange?.(nextValue)
          }}
          onValueChange={(item) => {
            const nextValue = item?.value ?? ""
            onValueChange(nextValue)
            setInputValue(item?.label ?? "")
            onSearchTermChange?.("")
          }}
          itemToStringLabel={(item) => item?.label ?? ""}
          isItemEqualToValue={(a, b) => (a?.value ?? "") === (b?.value ?? "")}
        >
          <div ref={anchor} className="w-full">
            <ComboboxInput
              id={id}
              showTrigger
              disabled={disabled || isLoading}
              placeholder={isLoading ? "Loading..." : placeholder}
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
            <ComboboxEmpty>{emptyContent}</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
            {onQuickAdd ? (
              <div
                className="shrink-0 border-t border-[rgba(214,227,255,0.4)]"
                onMouseDown={(event) => event.preventDefault()}
                onPointerDown={(event) => event.preventDefault()}
              >
                <QuickAddButton
                  label={quickAddLabel}
                  onClick={() => {
                    setOpen(false)
                    queueMicrotask(onQuickAdd)
                  }}
                />
              </div>
            ) : null}
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
        ) : searchError ? (
          <FieldDescription>
            Options could not be loaded. Your saved selection is still kept.
          </FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  )
}
