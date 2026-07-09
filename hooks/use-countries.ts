import { useQuery } from "@tanstack/react-query"

import { fetchCountryNames } from "@/services/countries.service"

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountryNames,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
