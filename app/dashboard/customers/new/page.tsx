"use client"

import { useState } from "react"
import Link from "next/link"
import { IconArrowLeft, IconMapPin, IconRoute, IconUsers } from "@tabler/icons-react"

import CustomerForm, { type CustomerFormValues } from "@/components/forms/customer-form"
import { ClientCard } from "@/components/directory/client-card"
import { CreateSteps } from "@/components/directory/create-steps"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

const EMPTY: CustomerFormValues = {
  customerCode: "",
  customerName: "",
  npwp: "",
  address: "",
  shipmentTypes: [],
  isActive: true,
}

const NEXT_UP = [
  { icon: IconRoute, text: "Add the shippers who send goods for this customer." },
  { icon: IconMapPin, text: "Add their pickup and drop-off places." },
  { icon: IconUsers, text: "Add the people to call at each place." },
]

export default function NewCustomerPage() {
  const [values, setValues] = useState<CustomerFormValues>(EMPTY)

  const steps = [
    {
      title: "Name and code",
      hint: "The company name and a short code.",
      done: values.customerName.trim() !== "" && values.customerCode.trim() !== "",
    },
    {
      title: "Type of work",
      hint: "Export, import or domestic. Pick one or more.",
      done: values.shipmentTypes.length > 0,
    },
    {
      title: "Tax ID and address",
      hint: "You can add these later.",
      done: values.npwp.trim() !== "" || values.address.trim() !== "",
      optional: true,
    },
  ]

  return (
    <PermissionGate resource="masterData" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="Add a customer"
          description="Fill in the form. The card on the right shows how this customer will look in the list."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/customers">
                <IconArrowLeft className="size-4" />
                Back to customers
              </Link>
            </Button>
          }
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
          <aside className="hidden xl:sticky xl:top-24 xl:block">
            <CreateSteps steps={steps} />
          </aside>

          <DashboardPageCard className="order-2 lg:order-none">
            <CustomerForm mode="create" onValuesChange={setValues} />
          </DashboardPageCard>

          <aside className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-none">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Live preview
              </p>
              <ClientCard customer={values} preview />
            </div>
            <div className="hidden rounded-2xl surface-inset p-5 lg:block">
              <p className="text-sm font-semibold text-foreground">After you save</p>
              <ul className="mt-3 space-y-3">
                {NEXT_UP.map((item) => (
                  <li key={item.text} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-primary shadow-elev-1">
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
