import { redirect } from "next/navigation"

import { SALES_MODULE_ENABLED } from "@/lib/feature-flags"

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!SALES_MODULE_ENABLED) {
    redirect("/dashboard/shipments")
  }

  return children
}
