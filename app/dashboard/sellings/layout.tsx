import { redirect } from "next/navigation"

import { SELLING_MODULE_ENABLED } from "@/lib/feature-flags"

export default function SellingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!SELLING_MODULE_ENABLED) {
    redirect("/dashboard/shipments")
  }

  return children
}
