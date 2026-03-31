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

export function formatDate(dateStr: string) {
  if (!dateStr) return "-";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const [year, month, day] = dateStr.split("-");

  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

export const getInitialContactName = (contactNames: string) => {
  return contactNames.split(" ").map((contactName: string) => contactName.charAt(0)).join("")
}