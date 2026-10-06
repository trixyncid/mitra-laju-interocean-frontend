import { redirect } from "next/navigation"

import { COSTING_MODULE_ENABLED } from "@/lib/feature-flags"

export default function CostingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!COSTING_MODULE_ENABLED) {
    redirect("/dashboard/shipments")
  }

  return children
}
