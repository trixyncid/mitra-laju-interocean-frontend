export type VendorRef = { vendorName: string; vendorCode: string } | null | undefined

/** "Vendor Name (CODE)", or whichever part is known. */
export function vendorLabel(vendor: VendorRef) {
  if (!vendor || (!vendor.vendorName && !vendor.vendorCode)) return null
  if (!vendor.vendorCode) return vendor.vendorName
  return `${vendor.vendorName} (${vendor.vendorCode})`
}
