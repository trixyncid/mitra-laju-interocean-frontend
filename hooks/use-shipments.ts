import { shipmentsService } from "@/services/shipments.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shipment } from "@/app/dashboard/shipments/columns";

export const useShipments = () => {
    return useQuery({
        queryKey: ["shipments"],
        queryFn: shipmentsService.getAll,
    });
}

export const useShipmentById = (id: string) => {
    return useQuery({
        queryKey: ["shipments", id],
        queryFn: () => shipmentsService.getById(id),
    });
}

export const useCreateShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: shipmentsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success("Shipment created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export const useUpdateShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, shipment }: { id: string, shipment: Partial<Shipment> }) => shipmentsService.update(id, shipment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success("Shipment updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export const useDeleteShipment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: shipmentsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success("Shipment deleted successfully");
        },
    });
}