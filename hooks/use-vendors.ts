import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { vendorsService } from "@/services/vendors.service"
import { toast } from "sonner"

export const useVendors = (enabled = true) => {
    return useQuery({
    queryKey: ["vendors"],
    queryFn: vendorsService.getAll,
    enabled,
})
}

export const useVendorById = (id: string) => {
    return useQuery({
        queryKey: ["vendors", id],
        queryFn: () => vendorsService.getById(id),
    })
}

export const useCreateVendor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (vendor: unknown) => vendorsService.create(vendor),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors"] })
            toast.success("Vendor created successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        }
    })
}

export const useUpdateVendor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, vendor }: { id: string, vendor: unknown }) => vendorsService.update(id, vendor),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors"] })
            toast.success("Vendor updated successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        }
    })
}

export const useDeleteVendor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }: { id: string }) => vendorsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors"] })
            toast.success("Vendor deleted successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message)
        }
    })
}

export const useCreateVendorLocation = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, location }: { vendorId: string, location: unknown }) => vendorsService.createLocation(vendorId, location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors", vendorId] })
            toast.success("Vendor location created successfully")
        },
    })
}

export const useUpdateVendorLocation = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, location }: { vendorId: string, locationId: string, location: unknown }) => vendorsService.updateLocation(vendorId, locationId, location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors", vendorId] })
            toast.success("Vendor location updated successfully")
        },
    })
}

export const useDeleteVendorLocation = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId }: { vendorId: string, locationId: string }) => vendorsService.deleteLocation(vendorId, locationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors", vendorId] })
            toast.success("Vendor location deleted successfully")
        },
    })
}

export const useCreateVendorContact = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, contact }: { vendorId: string, locationId: string, contact: unknown }) => vendorsService.createContact(vendorId, locationId, contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors", vendorId] })
            toast.success("Vendor location contact created successfully")
        },
    })
}

export const useUpdateVendorContact = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, contactId, contact }: { vendorId: string, locationId: string, contactId: string, contact: unknown }) => vendorsService.updateContact(vendorId, locationId, contactId, contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors", vendorId] })
            toast.success("Vendor location contact updated successfully")
        },
    })
}

export const useDeleteVendorContact = (vendorId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ vendorId, locationId, contactId }: { vendorId: string, locationId: string, contactId: string }) => vendorsService.deleteContact(vendorId, locationId, contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendors", vendorId] })
            toast.success("Vendor location contact deleted successfully")
        },
    })
}