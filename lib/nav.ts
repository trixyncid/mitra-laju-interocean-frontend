import {
  IconBox,
  IconTruckDelivery,
  IconBriefcase,
  IconBuildingLighthouse,
  IconBuildingWarehouse,
  IconCalculator,
  IconFileDollar,
  IconFileInvoice,
  IconLayoutDashboard,
  IconReceipt,
  IconShieldCog,
  IconShip,
  IconTruck,
  IconUserCog,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react"

import type { AppModule } from "@/lib/permissions"

/** Whether a nav href matches the current pathname (including detail routes). */
export function isSidebarNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export type NavLinkItem = {
  label: string
  href: string
  icon: Icon
  module: AppModule
  description?: string
}

export type NavEntry =
  | ({ kind: "link" } & NavLinkItem)
  | { kind: "group"; label: string; items: NavLinkItem[] }

/** Top-level navigation, in display order. Groups render as dropdowns. */
export const NAV_ENTRIES: NavEntry[] = [
  {
    kind: "link",
    label: "Overview",
    href: "/dashboard",
    icon: IconLayoutDashboard,
    module: "DASHBOARD",
  },
  {
    kind: "link",
    label: "Shipments",
    href: "/dashboard/shipments",
    icon: IconTruck,
    module: "SHIPMENT",
  },
  {
    kind: "group",
    label: "Commercial",
    items: [
      {
        label: "Sales",
        href: "/dashboard/sales",
        icon: IconBriefcase,
        module: "SALES",
        description: "Jobs tying shipments to their costs and charges",
      },
      {
        label: "Vendor Invoices",
        href: "/dashboard/vendor-invoices",
        icon: IconFileDollar,
        module: "VENDOR_INVOICE",
        description: "Payables from vendors",
      },
      {
        label: "Costing",
        href: "/dashboard/costings",
        icon: IconCalculator,
        module: "COSTING",
        description: "Job cost breakdowns",
      },
      {
        label: "Selling",
        href: "/dashboard/sellings",
        icon: IconReceipt,
        module: "SELLING",
        description: "Charges to customers and their margin",
      },
      {
        label: "Customer Invoices",
        href: "/dashboard/customer-invoices",
        icon: IconFileInvoice,
        module: "CUSTOMER_INVOICE",
        description: "Bills to customers and what's still unpaid",
      },
    ],
  },
  {
    kind: "group",
    label: "Master Data",
    items: [
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: IconUsersGroup,
        module: "CUSTOMER",
        description: "Shippers and consignees",
      },
      {
        label: "Vendors",
        href: "/dashboard/vendors",
        icon: IconBuildingWarehouse,
        module: "VENDOR",
        description: "Carriers and service partners",
      },
      {
        label: "Ports",
        href: "/dashboard/ports",
        icon: IconBuildingLighthouse,
        module: "PORT",
        description: "Loading and discharge ports",
      },
      {
        label: "Vessels",
        href: "/dashboard/vessels",
        icon: IconShip,
        module: "VESSEL",
        description: "Ships and voyages",
      },
      {
        label: "Containers",
        href: "/dashboard/containers",
        icon: IconBox,
        module: "CONTAINER",
        description: "Sizes and types",
      },
      {
        label: "Services",
        href: "/dashboard/services",
        icon: IconTruckDelivery,
        module: "SERVICE",
        description: "Trucking, freight and other services",
      },
    ],
  },
  {
    kind: "group",
    label: "Admin",
    items: [
      {
        label: "Users",
        href: "/dashboard/users",
        icon: IconUserCog,
        module: "USER",
        description: "Accounts and access",
      },
      {
        label: "Roles",
        href: "/dashboard/roles",
        icon: IconShieldCog,
        module: "ROLE",
        description: "Permission sets",
      },
    ],
  },
]

/** The nav item (and its group) a pathname belongs to, for page headers. */
export function navContextFor(pathname: string): { group: string | null; item: NavLinkItem } | null {
  for (const entry of NAV_ENTRIES) {
    if (entry.kind === "link") {
      if (isSidebarNavActive(pathname, entry.href)) return { group: null, item: entry }
      continue
    }
    const item = entry.items.find((candidate) => isSidebarNavActive(pathname, candidate.href))
    if (item) return { group: entry.label, item }
  }
  return null
}
