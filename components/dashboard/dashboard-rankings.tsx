"use client"

import type { ReactNode } from "react"
import Link from "next/link"

import type { DashboardData } from "@/app/dashboard/dashboard-types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { glassPanel, tableCellClass, tableHeaderCell, tableHeaderRow, tableRowClass, tableShell } from "@/lib/design"
import { cn } from "@/lib/utils"
import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"
import { usePermissions } from "@/hooks/use-permissions"

function formatIdr(value: number | string) {
  const amount = typeof value === "string" ? parseFloat(value) : value
  return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function RankingTable({
  title,
  description,
  headers,
  rows,
}: {
  title: string
  description: string
  headers: string[]
  rows: React.ReactNode
}) {
  return (
    <Card className={cn(glassPanel, "relative h-full min-w-0 gap-0 overflow-hidden p-5 shadow-none lg:p-6")}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.65)] to-transparent"
      />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={tableShell}>
          <Table>
            <TableHeader>
              <TableRow className={tableHeaderRow}>
                {headers.map((header) => (
                  <TableHead key={header} className={tableHeaderCell}>
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyRows({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={cn(tableCellClass, "py-10 text-center text-muted-foreground")}>
        {message}
      </TableCell>
    </TableRow>
  )
}

function RankingLink({
  href,
  canNavigate,
  children,
  title,
}: {
  href: string
  canNavigate: boolean
  children: ReactNode
  title?: string
}) {
  if (!canNavigate) {
    return (
      <span className="block truncate font-medium" title={title}>
        {children}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className="block truncate font-medium text-[var(--mli-primary-container)] hover:underline"
      title={title}
    >
      {children}
    </Link>
  )
}

function RankBadge({ index }: { index: number }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
        index === 0
          ? "bg-[var(--mli-primary-container)] text-primary-foreground"
          : index === 1
            ? "bg-[var(--chart-1)] text-primary-foreground"
            : index === 2
              ? "bg-[var(--chart-2)] text-primary-foreground"
              : "bg-[rgba(232,238,246,0.85)] text-muted-foreground"
      )}
    >
      {index + 1}
    </span>
  )
}

export function DashboardRankings({ data }: { data: DashboardData }) {
  const { canRead } = usePermissions()
  const canOpenMasterData = canRead("masterData")

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
      <RankingTable
        title="Top customers by shipments"
        description="Customers with the most active shipments in this period"
        headers={["Customer", "Code", "Shipments"]}
        rows={
          data.topCustomersByShipments.length === 0 ? (
            <EmptyRows colSpan={3} message="No customer shipment data in this range." />
          ) : (
            data.topCustomersByShipments.map((customer, index) => (
              <TableRow key={customer.customerId} className={tableRowClass}>
                <TableCell className={tableCellClass}>
                  <div className="flex items-center gap-2">
                    <RankBadge index={index} />
                    <RankingLink
                      href={`/dashboard/customers/${customer.customerId}`}
                      canNavigate={canOpenMasterData}
                      title={customer.customerName}
                    >
                      {customer.customerName}
                    </RankingLink>
                  </div>
                </TableCell>
                <TableCell className={cn(tableCellClass, "text-muted-foreground")}>
                  {customer.customerCode}
                </TableCell>
                <TableCell className={cn(tableCellClass, "text-right font-medium tabular-nums")}>
                  {customer.shipmentCount.toLocaleString("id-ID")}
                </TableCell>
              </TableRow>
            ))
          )
        }
      />

      {FINANCIAL_MODULES_ENABLED ? (
      <>
      <RankingTable
        title="Top customers by selling amount"
        description="Highest total selling amounts linked to each customer"
        headers={["Customer", "Code", "Total selling"]}
        rows={
          data.topCustomersBySellingAmount.length === 0 ? (
            <EmptyRows colSpan={3} message="No selling amount data in this range." />
          ) : (
            data.topCustomersBySellingAmount.map((customer, index) => (
              <TableRow key={customer.customerId} className={tableRowClass}>
                <TableCell className={tableCellClass}>
                  <div className="flex items-center gap-2">
                    <RankBadge index={index} />
                    <RankingLink
                      href={`/dashboard/customers/${customer.customerId}`}
                      canNavigate={canOpenMasterData}
                      title={customer.customerName}
                    >
                      {customer.customerName}
                    </RankingLink>
                  </div>
                </TableCell>
                <TableCell className={cn(tableCellClass, "text-muted-foreground")}>
                  {customer.customerCode}
                </TableCell>
                <TableCell className={cn(tableCellClass, "whitespace-nowrap text-right font-medium tabular-nums")}>
                  {formatIdr(customer.totalSellingAmount)}
                </TableCell>
              </TableRow>
            ))
          )
        }
      />

      <RankingTable
        title="Top vendors by costing count"
        description="Vendors with the most active costings"
        headers={["Vendor", "Code", "Costings"]}
        rows={
          data.topVendorsByCostingCount.length === 0 ? (
            <EmptyRows colSpan={3} message="No vendor costing data in this range." />
          ) : (
            data.topVendorsByCostingCount.map((vendor, index) => (
              <TableRow key={vendor.vendorId} className={tableRowClass}>
                <TableCell className={tableCellClass}>
                  <div className="flex items-center gap-2">
                    <RankBadge index={index} />
                    <RankingLink
                      href={`/dashboard/vendors/${vendor.vendorId}`}
                      canNavigate={canOpenMasterData}
                      title={vendor.vendorName}
                    >
                      {vendor.vendorName}
                    </RankingLink>
                  </div>
                </TableCell>
                <TableCell className={cn(tableCellClass, "text-muted-foreground")}>
                  {vendor.vendorCode}
                </TableCell>
                <TableCell className={cn(tableCellClass, "text-right font-medium tabular-nums")}>
                  {vendor.costingCount.toLocaleString("id-ID")}
                </TableCell>
              </TableRow>
            ))
          )
        }
      />

      <RankingTable
        title="Top vendors by total spend"
        description="Highest combined costing amounts (price × currency)"
        headers={["Vendor", "Code", "Total spend"]}
        rows={
          data.topVendorsByTotalAmount.length === 0 ? (
            <EmptyRows colSpan={3} message="No vendor spend data in this range." />
          ) : (
            data.topVendorsByTotalAmount.map((vendor, index) => (
              <TableRow key={vendor.vendorId} className={tableRowClass}>
                <TableCell className={tableCellClass}>
                  <div className="flex items-center gap-2">
                    <RankBadge index={index} />
                    <RankingLink
                      href={`/dashboard/vendors/${vendor.vendorId}`}
                      canNavigate={canOpenMasterData}
                      title={vendor.vendorName}
                    >
                      {vendor.vendorName}
                    </RankingLink>
                  </div>
                </TableCell>
                <TableCell className={cn(tableCellClass, "text-muted-foreground")}>
                  {vendor.vendorCode}
                </TableCell>
                <TableCell className={cn(tableCellClass, "whitespace-nowrap text-right font-medium tabular-nums")}>
                  {formatIdr(vendor.totalAmount)}
                </TableCell>
              </TableRow>
            ))
          )
        }
      />
      </>
      ) : null}
    </div>
  )
}
