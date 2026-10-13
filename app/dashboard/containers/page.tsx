"use client"

import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { EquipmentPanel } from "@/components/reference/equipment-catalog"

export default function ContainerMasterDataPage() {
  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Container catalog"
        description="The container sizes and types people can choose when they add containers to a shipment."
      />
      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-5">
        <EquipmentPanel kind="size" />
        <EquipmentPanel kind="type" />
      </div>
    </DashboardPage>
  )
}
