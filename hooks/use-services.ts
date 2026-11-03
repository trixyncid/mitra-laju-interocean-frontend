import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesService, type ServiceListParams } from "@/services/services.service";
import { serviceKeys, vendorKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { Service } from "@/app/dashboard/services/columns";

export const useServices = (params: ServiceListParams, enabled = true) => {
    return useQuery({
        queryKey: serviceKeys.list(params),
        queryFn: () => servicesService.getAll(params),
        enabled,
    });
}

/** Every active service, for pickers (the catalog is small). */
export const useActiveServices = (enabled = true) =>
    useServices({ page: 1, pageSize: 100, status: "true" }, enabled)

export const useCreateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: servicesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: serviceKeys.all });
            toast.success("Service created successfully");
        },
    });
}

export const useUpdateService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, service }: { id: string, service: Partial<Service> }) => servicesService.update(id, service),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: serviceKeys.all });
            // Vendors show their services by name.
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
            toast.success("Service updated successfully");
        },
    });
}

export const useDeleteService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: servicesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: serviceKeys.all });
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
            toast.success("Service deleted successfully");
        },
    });
}
