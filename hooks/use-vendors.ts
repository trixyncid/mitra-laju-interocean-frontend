import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import type { VendorDetail } from "@/lib/types/entity-details"
import { vendorsService, type VendorListParams } from "@/services/vendors.service"
import { vendorKeys } from "@/lib/query-keys"
import { toast } from "sonner"

export const useVendors = (params: VendorListParams, enabled = true) => {
    return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () => vendorsService.getAll(params),
    enabled,
})
}

export const useVendorById = (id: string) => {
    return useQuery({
        queryKey: vendorKeys.detail(id),
        queryFn: () => vendorsService.getById(id),
        enabled: !!id,
    })
}

export const useCreateVendor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: vendorsService.create as (
            vendor: Partial<Vendor>
        ) => Promise<Vendor>,
        onSuccess: (data) => {
            if (data?.id) {
                queryClient.setQueryData(vendorKeys.detail(data.id), data)
            }
            queryClient.invalidateQueries({ queryKey: vendorKeys.all })
            toast.success("Vendor created successfully")
        },
    })
}

export const useUpdateVendor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, vendor }: { id: string, vendor: Partial<Vendor> }) =>
            vendorsService.update(id, vendor),
        onSuccess: (data, { id }) => {
            queryClient.setQueryData<VendorDetail>(vendorKeys.detail(id), (existing) =>
                existing ? { ...existing, ...data } : data
            )
            queryClient.invalidateQueries({ queryKey: vendorKeys.all })
            toast.success("Vendor updated successfully")
        },
    })
}

export const useDeleteVendor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: string }) => vendorsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all })
            toast.success("Vendor deleted successfully")
        },
    })
}

export const useCreateVendorLocation = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, location }: { vendorId: string, location: unknown }) => vendorsService.createLocation(vendorId, location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) })
            toast.success("Vendor location created successfully")
        },
    })
}

export const useUpdateVendorLocation = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, location }: { vendorId: string, locationId: string, location: unknown }) => vendorsService.updateLocation(vendorId, locationId, location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) })
            toast.success("Vendor location updated successfully")
        },
    })
}

export const useDeleteVendorLocation = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId }: { vendorId: string, locationId: string }) => vendorsService.deleteLocation(vendorId, locationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) })
            toast.success("Vendor location deleted successfully")
        },
    })
}

export const useCreateVendorContact = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, contact }: { vendorId: string, locationId: string, contact: unknown }) => vendorsService.createContact(vendorId, locationId, contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) })
            toast.success("Vendor location contact created successfully")
        },
    })
}

export const useUpdateVendorContact = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, contactId, contact }: { vendorId: string, locationId: string, contactId: string, contact: unknown }) => vendorsService.updateContact(vendorId, locationId, contactId, contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) })
            toast.success("Vendor location contact updated successfully")
        },
    })
}

export const useDeleteVendorContact = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, contactId }: { vendorId: string, locationId: string, contactId: string }) => vendorsService.deleteContact(vendorId, locationId, contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) })
            toast.success("Vendor location contact deleted successfully")
        },
    })
}