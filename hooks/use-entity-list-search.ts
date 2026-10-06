import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useDebouncedValue } from "@/hooks/use-debounced-value"

type PaginatedResult<T> = {
  items: T[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
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
  pageSize = 25,
  page = 1
) {
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  return useQuery({
    queryKey: [...queryKey, debouncedSearch, baseParams, page, pageSize],
    queryFn: () =>
      queryFn({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        ...baseParams,
      } as TParams),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
