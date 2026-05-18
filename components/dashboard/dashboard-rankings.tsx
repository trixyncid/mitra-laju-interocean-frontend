"use client"

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
import { tableCellClass, tableHeaderCell, tableHeaderRow, tableRowClass } from "@/lib/design"
import { cn } from "@/lib/utils"

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
    <Card className="h-full min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
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

export function DashboardRankings({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <Link
                      href={`/dashboard/customers/${customer.customerId}`}
                      className="block truncate font-medium text-primary hover:underline"
                      title={customer.customerName}
                    >
                      {customer.customerName}
                    </Link>
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

      <RankingTable
        title="Top customers by charge amount"
        description="Highest total customer charges from operationals"
        headers={["Customer", "Code", "Total charge"]}
        rows={
          data.topCustomersByChargeAmount.length === 0 ? (
            <EmptyRows colSpan={3} message="No charge amount data in this range." />
          ) : (
            data.topCustomersByChargeAmount.map((customer, index) => (
              <TableRow key={customer.customerId} className={tableRowClass}>
                <TableCell className={tableCellClass}>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <Link
                      href={`/dashboard/customers/${customer.customerId}`}
                      className="block truncate font-medium text-primary hover:underline"
                      title={customer.customerName}
                    >
                      {customer.customerName}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className={cn(tableCellClass, "text-muted-foreground")}>
                  {customer.customerCode}
                </TableCell>
                <TableCell className={cn(tableCellClass, "whitespace-nowrap text-right font-medium tabular-nums")}>
                  {formatIdr(customer.totalChargeAmount)}
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
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <Link
                      href={`/dashboard/vendors/${vendor.vendorId}`}
                      className="block truncate font-medium text-primary hover:underline"
                      title={vendor.vendorName}
                    >
                      {vendor.vendorName}
                    </Link>
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
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {index + 1}
                    </span>
                    <Link
                      href={`/dashboard/vendors/${vendor.vendorId}`}
                      className="block truncate font-medium text-primary hover:underline"
                      title={vendor.vendorName}
                    >
                      {vendor.vendorName}
                    </Link>
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
    </div>
  )
}
