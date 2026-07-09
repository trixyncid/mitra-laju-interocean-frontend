const NUMBER_INPUT_PATTERN = /^[\d.,]*$/

export function sanitizeNumberInput(raw: string) {
  return raw.replace(/[^\d.,]/g, "")
}

export function isValidNumberInput(raw: string) {
  return NUMBER_INPUT_PATTERN.test(raw)
}

export function parseLocaleNumber(input: string): number | "" {
  const trimmed = sanitizeNumberInput(input.trim())
  if (!trimmed) return ""

  const normalized = trimmed.replace(/\./g, "").replace(",", ".")
  if (!normalized || normalized === ".") return ""

  const num = Number(normalized)
  return Number.isFinite(num) ? num : ""
}

export function formatLocaleNumber(
  value: number | string | "",
  options?: {
    useGrouping?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
) {
  if (value === "" || value === null || value === undefined) return ""

  const num =
    typeof value === "number" ? value : parseLocaleNumber(String(value))

  if (num === "") return ""

  if (options?.useGrouping === false) {
    const maximumFractionDigits = options.maximumFractionDigits ?? 2
    return new Intl.NumberFormat("id-ID", {
      useGrouping: false,
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits,
    }).format(num)
  }

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(num)
}

export function formatNumberInputLive(
  raw: string,
  options?: {
    useGrouping?: boolean
    maximumFractionDigits?: number
  }
) {
  const sanitized = sanitizeNumberInput(raw)
  if (!sanitized) return ""

  const useGrouping = options?.useGrouping ?? true
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2
  const commaIndex = sanitized.indexOf(",")
  const wholeRaw = commaIndex === -1 ? sanitized : sanitized.slice(0, commaIndex)
  const decimalRaw = commaIndex === -1 ? "" : sanitized.slice(commaIndex + 1)
  const wholeParsed = parseLocaleNumber(wholeRaw)

  if (wholeParsed === "") {
    return sanitized
  }

  const formattedWhole = formatLocaleNumber(wholeParsed, {
    useGrouping,
    maximumFractionDigits: 0,
  })

  if (commaIndex === -1) {
    return formattedWhole
  }

  const trimmedDecimal = decimalRaw.slice(0, maximumFractionDigits)
  return trimmedDecimal.length > 0
    ? `${formattedWhole},${trimmedDecimal}`
    : `${formattedWhole},`
}

export function formatNumberFieldDisplay(
  value: number | string | "",
  options?: {
    useGrouping?: boolean
    maximumFractionDigits?: number
  }
) {
  if (value === "" || value === null || value === undefined) return ""

  const num =
    typeof value === "number" ? value : parseLocaleNumber(String(value))

  if (num === "") return sanitizeNumberInput(String(value))

  return formatLocaleNumber(num, {
    useGrouping: options?.useGrouping ?? true,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  })
}
