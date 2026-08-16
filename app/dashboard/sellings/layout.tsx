import { redirect } from "next/navigation"

import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"

export default function SellingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!FINANCIAL_MODULES_ENABLED) {
    redirect("/dashboard/shipments")
  }

  return children
}
