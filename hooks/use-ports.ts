import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portsService, type PortListParams } from "@/services/ports.service";
import { toast } from "sonner";
import { Port } from "@/app/dashboard/ports/columns";

export const usePorts = (params: PortListParams, enabled = true) => {
    return useQuery({
        queryKey: ["ports", params],
        queryFn: () => portsService.getAll(params),
        enabled,
    });
}

export const useCreatePort = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: portsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ports"] });
            toast.success("Port created successfully");
        },
        onError: (error: Error) => {
            toast.warning(error.message);
        },
    });
}

export const useUpdatePort = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, port }: { id: string, port: Partial<Port> }) => portsService.update(id, port),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ports"] });
            toast.success("Port updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export const useDeletePort = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: portsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ports"] });
            toast.success("Port deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}