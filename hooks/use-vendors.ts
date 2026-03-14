import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { vendorsService } from "@/services/vendors.service"
import { toast } from "sonner"

export const useVendors = () => {
    return useQuery({
    queryKey: ["vendors"],
    queryFn: vendorsService.getAll,
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