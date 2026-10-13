import { redirect } from "next/navigation"

import { CUSTOMER_INVOICE_MODULE_ENABLED } from "@/lib/feature-flags"

export default function CustomerInvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!CUSTOMER_INVOICE_MODULE_ENABLED) {
    redirect("/dashboard/shipments")
  }

  return children
}
