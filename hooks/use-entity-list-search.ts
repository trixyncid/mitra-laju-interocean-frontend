import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useDebouncedValue } from "@/hooks/use-debounced-value"

type PaginatedResult<T> = {
  items: T[]
}

type ListParams = {
  page: number
  pageSize: number
  search?: string
}

export function useEntityListSearch<TItem, TParams extends ListParams>(
  queryKey: readonly unknown[],
  queryFn: (params: TParams) => Promise<PaginatedResult<TItem>>,
  search: string,
  enabled: boolean,
  baseParams?: Omit<TParams, keyof ListParams>,
  pageSize = 25
) {
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  return useQuery({
    queryKey: [...queryKey, debouncedSearch, baseParams],
    queryFn: () =>
      queryFn({
        page: 1,
        pageSize,
        search: debouncedSearch || undefined,
        ...baseParams,
      } as TParams),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
