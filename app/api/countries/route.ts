import { NextResponse } from "next/server"

import fallbackCountryNames from "@/lib/country-names.fallback.json"

type CountriesNowResponse = {
  error: boolean
  data: Array<{
    country: string
  }>
}

const COUNTRIES_NOW_URL = "https://countriesnow.space/api/v0.1/countries"

function sortCountryNames(names: string[]) {
  return [...new Set(names)].sort((a, b) => a.localeCompare(b))
}

async function fetchCountriesFromApi(): Promise<string[]> {
  const response = await fetch(COUNTRIES_NOW_URL, {
    next: { revalidate: 60 * 60 * 24 },
  })

  if (!response.ok) {
    throw new Error("Countries API request failed")
  }

  const payload = (await response.json()) as CountriesNowResponse

  if (payload.error || !Array.isArray(payload.data)) {
    throw new Error("Countries API returned an invalid payload")
  }

  return sortCountryNames(payload.data.map((entry) => entry.country))
}

export async function GET() {
  try {
    const names = await fetchCountriesFromApi()

    return NextResponse.json(names, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    })
  } catch {
    return NextResponse.json(sortCountryNames(fallbackCountryNames), {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    })
  }
}
