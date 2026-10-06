import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** @deprecated Use `toIsoDateOnly` / `formatCalendarDate`. Kept so leftover callers do not write UTC end-of-day. */
export function ISOFormat(date: string) {
  return date.split("T")[0] ?? date
}

/**
 * Function to format a date string to a readable format
 * @param dateStr - The date string to format
 * @returns The formatted date string
 */
export function formatDate(dateStr: string) {
  if (!dateStr) return "-";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const [year, month, day] = dateStr.split("-");

  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

/**
 * Function to get the initial contact name
 * @param contactNames - The contact names
 * @returns The initial contact name
 */
export const getInitialContactName = (contactNames: string) => {
  return contactNames.split(" ").map((contactName: string) => contactName.charAt(0)).join("")
}

/**
 * Function to calculate the net amount of a costing
 * @param price - The price of the costing
 * @param currency - The currency of the costing
 * @param vatPercentage - The VAT percentage of the costing
 * @param pph23Percentage - The PPH 23 percentage of the costing
 * @returns The net amount of the costing
 */
export const amountCalculation = (
  price: number | string,
  currency: number | string,
  vatPercentage: number | string,
  pph23Percentage: number | string
) => {
  const p = Number(price) || 0
  const c = Number(currency) || 0
  const vat = Number(vatPercentage) || 0
  const pph = Number(pph23Percentage) || 0
  const subtotal = p * c
  return subtotal - (subtotal * vat) / 100 - (subtotal * pph) / 100
}

/** Line gross in IDR: unit price × FX rate × quantity. */
export function costingLineGross(line: {
  price: number | string
  currencyPrice: number | string
  quantity?: number | string | null
}) {
  const price = Number(line.price) || 0
  const rate = Number(line.currencyPrice) || 0
  const qty = Number(line.quantity) || 1
  return price * rate * qty
}

type CostingTaxLine = {
  price: number | string
  currencyPrice: number | string
  quantity?: number | string | null
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
}

/** Per-line VAT / PPN amount from gross. */
export function costingLineVatAmount(line: CostingTaxLine) {
  const gross = costingLineGross(line)
  const vat = Number(line.vatPercentage) || 0
  return (gross * vat) / 100
}

/** Per-line PPH 23 amount withheld from gross. */
export function costingLinePph23Amount(line: CostingTaxLine) {
  const gross = costingLineGross(line)
  const pph = Number(line.pph23Percentage) || 0
  return (gross * pph) / 100
}

/** Line amount after adding PPN: gross + VAT. */
export function costingLineUnitPlusPpn(line: CostingTaxLine) {
  return costingLineGross(line) + costingLineVatAmount(line)
}

/** Per-line invoice net: gross + VAT − PPH23. */
export function costingInvoiceLineNet(line: CostingTaxLine) {
  return (
    costingLineGross(line) +
    costingLineVatAmount(line) -
    costingLinePph23Amount(line)
  )
}

/** Invoice totals from active breakdown lines (per-line VAT added, PPH23 withheld). */
export function costingInvoiceTotals(
  lines: Array<{
    price: number | string
    currencyPrice: number | string
    quantity?: number | string | null
    vatPercentage?: number | string | null
    pph23Percentage?: number | string | null
  }>
) {
  return lines.reduce(
    (acc, line) => {
      const gross = costingLineGross(line)
      const vat = Number(line.vatPercentage) || 0
      const pph = Number(line.pph23Percentage) || 0
      const vatAmount = (gross * vat) / 100
      const pph23Amount = (gross * pph) / 100
      return {
        gross: acc.gross + gross,
        vatAmount: acc.vatAmount + vatAmount,
        pph23Amount: acc.pph23Amount + pph23Amount,
        net: acc.net + gross + vatAmount - pph23Amount,
      }
    },
    { gross: 0, vatAmount: 0, pph23Amount: 0, net: 0 }
  )
}

/**
 * Vendor cost for a shipment-linked costing line (same invoice formula).
 */
export function costingShipmentLineNet(line: {
  price: number | string
  currencyPrice: number | string
  quantity?: number | string | null
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
}) {
  return costingInvoiceLineNet(line)
}

/** Sum of shipment-linked costing line nets (per-line invoice VAT + PPH23). */
export function costingShipmentNetTotal(
  lines: Array<{
    price: number | string
    currencyPrice: number | string
    quantity?: number | string | null
    vatPercentage?: number | string | null
    pph23Percentage?: number | string | null
  }>
) {
  return lines.reduce((sum, line) => sum + costingShipmentLineNet(line), 0)
}

/**
 * Function to format a date string to a local date format
 * @param dateStr - The date string to format (ISO 8601 format)
 * @returns The formatted date string (DD MMM YYYY)
 */
export const localDate = (dateStr: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateStr))
}

/**
 * Customer-side net: amount + VAT − PPH23 (same pattern as vendor invoice net).
 */
export const sellingNetAmount = (
  amount: number,
  vatPercentage: number,
  pph23Percentage: number
) => {
  return amount + (amount * vatPercentage) / 100 - (amount * pph23Percentage) / 100
}

export function costingSellingLineNet(line: {
  sellingAmount?: number | string | null
  sellingVatPercentage?: number | string | null
  sellingPph23Percentage?: number | string | null
}) {
  return sellingNetAmount(
    Number(line.sellingAmount) || 0,
    Number(line.sellingVatPercentage) || 0,
    Number(line.sellingPph23Percentage) || 0
  )
}

export function sellingInvoiceLineNet(line: {
  amount?: number | string | null
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
}) {
  return sellingNetAmount(
    Number(line.amount) || 0,
    Number(line.vatPercentage) || 0,
    Number(line.pph23Percentage) || 0
  )
}

export function sellingInvoiceNetTotal(
  lines: Array<{
    amount?: number | string | null
    vatPercentage?: number | string | null
    pph23Percentage?: number | string | null
  }>
) {
  return lines.reduce((sum, line) => sum + sellingInvoiceLineNet(line), 0)
}

type InvoiceProfitLine = {
  price?: number | string | null
  currencyPrice?: number | string | null
  quantity?: number | string | null
  vatPercentage?: number | string | null
  sellingAmount?: number | string | null
  sellingPph23Percentage?: number | string | null
}

/**
 * Profit on one invoiced costing line:
 * (price × currency rate × quantity + VAT) − selling amount − selling PPH 23.
 * VAT is the vendor vatPercentage of the line gross. PPH 23 is
 * sellingPph23Percentage of the selling amount.
 */
export function invoiceLineProfit(line: InvoiceProfitLine) {
  const amountPlusVat = costingLineUnitPlusPpn({
    price: line.price ?? 0,
    currencyPrice: line.currencyPrice ?? 0,
    quantity: line.quantity,
    vatPercentage: line.vatPercentage,
  })
  const sellingAmount = Number(line.sellingAmount) || 0
  const pphRate = Number(line.sellingPph23Percentage) || 0
  const sellingPphAmount = (sellingAmount * pphRate) / 100
  return amountPlusVat - sellingAmount - sellingPphAmount
}

export function invoiceProfit(lines: InvoiceProfitLine[]) {
  return lines.reduce((sum, line) => sum + invoiceLineProfit(line), 0)
}