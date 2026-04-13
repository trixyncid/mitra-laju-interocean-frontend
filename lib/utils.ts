import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ISOFormat(date: string) {
  const d = new Date(date)
  d.setUTCHours(23, 59, 59, 999)

  return d.toISOString()
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
export const amountCalculation = (price: number, currency: number, vatPercentage: number, pph23Percentage: number) => {
  return (price * currency) - (price * currency * vatPercentage / 100) - (price * currency * pph23Percentage / 100)
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