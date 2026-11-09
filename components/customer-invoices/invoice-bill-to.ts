import type { InvoiceBillTo } from "@/components/customer-invoices/invoice-print-sheet"
import type { CustomerDetail, CustomerLocation } from "@/lib/types/entity-details"

function formatAddress(location: CustomerLocation) {
  return [
    location.addressLine1,
    location.addressLine2,
    location.addressLine3,
    [location.city, location.province, location.postalCode].filter(Boolean).join(", "),
    location.country,
  ].filter((line): line is string => Boolean(line?.trim()))
}

/** The customer's first office address, when the role may read it. */
function firstAddress(customer: CustomerDetail | undefined) {
  const location = customer?.customerShippers
    ?.filter((shipper) => shipper.isActive !== false)
    .flatMap((shipper) => shipper.customerLocations ?? [])[0]
  return location ? formatAddress(location) : undefined
}

/** Who the printed invoice is addressed to; NPWP and address only when the customer could be loaded. */
export function invoiceBillTo(
  ref: { customerName?: string | null; customerCode?: string | null } | null | undefined,
  customer: CustomerDetail | undefined
): InvoiceBillTo {
  return {
    name: ref?.customerName ?? "—",
    code: ref?.customerCode ?? undefined,
    npwp: customer?.npwp || null,
    addressLines: firstAddress(customer),
  }
}
