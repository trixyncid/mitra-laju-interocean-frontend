import { redirect } from "next/navigation"

import { VENDOR_INVOICE_MODULE_ENABLED } from "@/lib/feature-flags"

export default function VendorInvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!VENDOR_INVOICE_MODULE_ENABLED) {
    redirect("/dashboard/shipments")
  }

  return children
}
