import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { customerInvoiceKeys, salesKeys, sellingLineKeys, shipmentKeys } from "@/lib/query-keys"
import type { CustomerInvoiceInput, CustomerInvoiceType, CustomerInvoiceUpdate } from "@/lib/types/customer-invoice"
import { customerInvoiceService, type CustomerInvoiceListParams } from "@/services/customer-invoice.service"

/** Billing a line changes the job and selling views too. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: customerInvoiceKeys.all })
  queryClient.invalidateQueries({ queryKey: salesKeys.all })
  queryClient.invalidateQueries({ queryKey: sellingLineKeys.all })
  queryClient.invalidateQueries({ queryKey: shipmentKeys.all })
}

export const useInfiniteCustomerInvoices = (params: Omit<CustomerInvoiceListParams, "page">, enabled = true) =>
  useInfiniteQuery({
    queryKey: [...customerInvoiceKeys.lists(), "infinite", params],
    queryFn: ({ pageParam }) => customerInvoiceService.getAll({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    enabled,
  })

/** One page of invoices, for the table view (the split view loads batches instead). */
export const useCustomerInvoicesPage = (params: CustomerInvoiceListParams, enabled = true) =>
  useQuery({
    queryKey: [...customerInvoiceKeys.lists(), "page", params],
    queryFn: () => customerInvoiceService.getAll(params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useCustomerInvoice = (id: string) =>
  useQuery({
    queryKey: customerInvoiceKeys.detail(id),
    queryFn: () => customerInvoiceService.getById(id),
    enabled: !!id,
  })

/** The default number for a new invoice: the sales number, or `-2`, `-3`… once taken. */
export const useNextInvoiceNumber = (salesId: string | undefined, type: CustomerInvoiceType, enabled = true) =>
  useQuery({
    queryKey: customerInvoiceKeys.nextNumber(salesId ?? "", type),
    queryFn: () => customerInvoiceService.nextNumber(salesId!, type),
    enabled: enabled && !!salesId,
    staleTime: 0,
  })

export const useCreateCustomerInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invoice: CustomerInvoiceInput) => customerInvoiceService.create(invoice),
    onSuccess: (invoice) => {
      invalidate(queryClient)
      toast.success(`Invoice ${invoice.customerInvoiceNumber} created`)
    },
  })
}

export const useUpdateCustomerInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, invoice }: { id: string; invoice: CustomerInvoiceUpdate; message?: string }) =>
      customerInvoiceService.update(id, invoice),
    onSuccess: (invoice, { message }) => {
      invalidate(queryClient)
      toast.success(message ?? `Invoice ${invoice.customerInvoiceNumber} updated`)
    },
  })
}

export const useDeleteCustomerInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => customerInvoiceService.delete(id),
    onSuccess: () => {
      invalidate(queryClient)
      toast.success("Invoice deleted")
    },
  })
}
