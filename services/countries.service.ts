export type CountryOption = {
  value: string
  label: string
}

export async function fetchCountryNames(): Promise<string[]> {
  const response = await fetch("/api/countries")

  if (!response.ok) {
    throw new Error("Failed to load countries")
  }

  return (await response.json()) as string[]
}

export function buildCountryOptions(
  countries: string[],
  currentValue?: string | null
): CountryOption[] {
  const names = [...countries]
  const trimmed = currentValue?.trim() ?? ""

  if (
    trimmed &&
    !names.some((name) => name.localeCompare(trimmed, undefined, { sensitivity: "accent" }) === 0)
  ) {
    names.push(trimmed)
  }

  return names
    .map((name) => ({ value: name, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function findCountryOption(
  options: CountryOption[],
  value?: string | null
): CountryOption | null {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return null

  return (
    options.find(
      (option) =>
        option.value.localeCompare(trimmed, undefined, { sensitivity: "accent" }) === 0
    ) ?? { value: trimmed, label: trimmed }
  )
}
