"use client"

import { useState } from "react"
import Link from "next/link"
import { IconArrowLeft, IconBuildingWarehouse, IconReceipt, IconUsers } from "@tabler/icons-react"

import VendorForm, { type VendorFormValues } from "@/components/forms/vendor-form"
import { CreateSteps } from "@/components/directory/create-steps"
import { RosterRow } from "@/components/directory/supplier-roster"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

const EMPTY: VendorFormValues = {
  vendorCode: "",
  vendorName: "",
  npwp: "",
  shipmentTypes: [],
  serviceIds: [],
  isActive: true,
}

const NEXT_UP = [
  { icon: IconBuildingWarehouse, text: "Add the vendor's offices." },
  { icon: IconUsers, text: "Add the people to call at each office." },
  { icon: IconReceipt, text: "Record their invoices in Vendor invoices." },
]

export default function NewVendorPage() {
  const [values, setValues] = useState<VendorFormValues>(EMPTY)
  const letter = values.vendorName.trim().charAt(0).toUpperCase()

  const steps = [
    {
      title: "Name and code",
      hint: "The company name and a short code.",
      done: values.vendorName.trim() !== "" && values.vendorCode.trim() !== "",
    },
    {
      title: "Type of work",
      hint: "Export, import or domestic. Pick one or more.",
      done: values.shipmentTypes.length > 0,
    },
    {
      title: "Tax ID (NPWP)",
      hint: "Needed for tax reports. You can add it later.",
      done: values.npwp.trim() !== "",
      optional: true,
    },
  ]

  return (
    <PermissionGate resource="masterData" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="Add a vendor"
          description="Fill in the form. On the right you can see where this vendor will sit in the A–Z list."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/vendors">
                <IconArrowLeft className="size-4" />
                Back to vendors
              </Link>
            </Button>
          }
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[260px_minmax(0,1fr)_360px]">
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <CreateSteps steps={steps} />
          </aside>

          <DashboardPageCard className="order-2 lg:order-none">
            <VendorForm mode="create" onValuesChange={setValues} />
          </DashboardPageCard>

          <aside className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-none">
            <div className="rounded-2xl surface-inset p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Live preview in the A–Z list
              </p>
              <div className="mb-2.5 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl brand-fill text-base font-semibold text-primary-foreground">
                  {letter ? (/[A-Z]/.test(letter) ? letter : "#") : "?"}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>
              <RosterRow vendor={{ id: "preview", ...values }} preview />
            </div>
            <div className="hidden rounded-2xl surface p-5 lg:block">
              <p className="text-sm font-semibold text-foreground">After you save</p>
              <ul className="mt-3 space-y-3">
                {NEXT_UP.map((item) => (
                  <li key={item.text} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)]">
                      <item.icon className="size-3.5" />
                    </span>
                    <span className="pt-1">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </DashboardPage>
    </PermissionGate>
  )
}
