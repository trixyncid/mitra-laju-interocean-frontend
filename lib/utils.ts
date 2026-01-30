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
