import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { customersService } from "@/services/customers.service"
import { customerKeys } from "@/lib/query-keys"

const CUSTOMER_SEARCH_PAGE_SIZE = 25

export function useCustomerSearch(search: string, enabled = true) {
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  return useQuery({
    queryKey: customerKeys.search(debouncedSearch),
    queryFn: () =>
      customersService.getAll({
        page: 1,
        pageSize: CUSTOMER_SEARCH_PAGE_SIZE,
        search: debouncedSearch || undefined,
      }),
    enabled,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
