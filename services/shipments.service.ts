import { Shipment } from "@/app/dashboard/shipments/columns";
import { apiClient } from "@/lib/api-client";

export const shipmentsService = {
    getAll: async () => {
        const response = await apiClient.get("/shipments");
        console.log(response)
        return response;
    },
    getById: async (id: string) => {
        const response = await apiClient.get(`/shipments/${id}`);
        return response;
    },
    create: async (shipment: Shipment) => {
        const response = await apiClient.post("/shipments", shipment);
        return response;
    },
    update: async (id: string, shipment: Partial<Shipment>) => {
        const response = await apiClient.put(`/shipments/${id}`, shipment);
        return response;
    },
    delete: async (id: string) => {
        const response = await apiClient.delete(`/shipments/${id}`);
        return response;
    },
    createShipmentOperational: async (shipmentId: string, shipmentOperational: unknown) => {
        const response = await apiClient.post(`/shipments/${shipmentId}/operational`, shipmentOperational);
        return response;
    },
    updateShipmentOperational: async (shipmentId: string, id: string, shipmentOperational: unknown) => {
        const response = await apiClient.put(`/shipments/${shipmentId}/operational/${id}`, shipmentOperational);
        return response;
    },
    deleteShipmentOperational: async (shipmentId: string, id: string) => {
        const response = await apiClient.delete(`/shipments/${shipmentId}/operational/${id}`);
        return response;
    },
    getShipmentOperationalContainers: async () => {
        const response = await apiClient.get("/containers")
        return response;
    },
    createShipmentOperationalContainer: async (shipmentId: string, shipmentOperationalId: string, shipmentOperationalContainer: unknown) => {
        const response = await apiClient.post(`/shipments/${shipmentId}/operational/${shipmentOperationalId}/containers`, shipmentOperationalContainer);
        return response;
    },
    updateShipmentOperationalContainer: async (shipmentId: string, shipmentOperationalId: string, id: string, shipmentOperationalContainer: unknown) => {
        const response = await apiClient.put(`/shipments/${shipmentId}/operational/${shipmentOperationalId}/containers/${id}`, shipmentOperationalContainer);
        return response;
    },
    deleteShipmentOperationalContainer: async (shipmentId: string, shipmentOperationalId: string, id: string) => {
        const response = await apiClient.delete(`/shipments/${shipmentId}/operational/${shipmentOperationalId}/containers/${id}`);
        return response;
    },
}