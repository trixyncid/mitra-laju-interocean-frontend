import { useQuery } from "@tanstack/react-query"
import { vendorsService } from "@/services/vendors.service"

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