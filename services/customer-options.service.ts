import type { Customer } from "@/app/dashboard/customers/columns"

export type CustomerOption = {
  value: string
  label: string
  customerCode: string
  customerName: string
}

type CustomerLike = Pick<Customer, "id" | "customerCode" | "customerName">

export function formatCustomerLabel(customer: Pick<Customer, "customerCode" | "customerName">) {
  return `${customer.customerCode} (${customer.customerName})`
}

export function customerToOption(customer: CustomerLike): CustomerOption {
  return {
    value: customer.id ?? "",
    label: formatCustomerLabel(customer),
    customerCode: customer.customerCode,
    customerName: customer.customerName,
  }
}

export function buildCustomerOptions(
  customers: CustomerLike[],
  selected?: CustomerLike | null
): CustomerOption[] {
  const options = new Map<string, CustomerOption>()

  for (const customer of customers) {
    if (!customer.id) continue
    options.set(customer.id, customerToOption(customer))
  }

  if (selected?.id && !options.has(selected.id)) {
    options.set(selected.id, customerToOption(selected))
  }

  return Array.from(options.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  )
}

export function findCustomerOption(
  options: CustomerOption[],
  value?: string | null,
  selected?: CustomerLike | null
): CustomerOption | null {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return null

  const matched = options.find((option) => option.value === trimmed)
  if (matched) return matched

  if (selected?.id === trimmed) {
    return customerToOption(selected)
  }

  return null
}
