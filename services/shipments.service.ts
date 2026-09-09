import { Shipment } from "@/app/dashboard/shipments/columns";
import { apiClient } from "@/lib/api-client";
import { openFetchedAttachment } from "@/lib/open-attachment";
import type { ShipmentDetail } from "@/lib/types/entity-details";
import type { ShipmentStatus } from "@/lib/shipment-status";

export type CreateShipmentInput = {
    orderNumber?: string;
    month?: number;
    year?: number;
    customerCodeId: string;
    customerShipperId: string;
    status?: ShipmentStatus;

};

export type CreatedShipment = {
    id: string;
    orderNumber: string;
    customerCodeId: string;
    customerShipperId: string;
    status: ShipmentStatus;
};

export type CreateShipmentOperationalInput = {
    shipmentId: string;
    shipmentType: string;
    vesselId: string;
    portDepartureId?: string;
    portDestinationId?: string;
    eta?: string | null;
    loadingInAt?: string | null;
    loadingOutAt?: string | null;
    blNumber?: string;
    bookingNumber?: string;
    loadingLocationId?: string;
    unloadingLocationId?: string;
    truckingBookToId?: string;
    freightBookToId?: string;
    remarks?: string;
};

export type ShipmentListParams = {
    page: number;
    pageSize: number;
    search?: string;
    status?: "all" | "true" | "false";
    lifecycleStatus?: "all" | "DRAFT" | "BACKUP" | "ONGOING" | "FINISHED";
    from?: string;
    to?: string;
};

export type PaginatedShipments = {
    items: Shipment[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

export const shipmentsService = {
    getAll: async (params: ShipmentListParams): Promise<PaginatedShipments> => {
        const query = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            status: params.status ?? "all",
            lifecycleStatus: params.lifecycleStatus ?? "all",
        });
        if (params.search) query.set("search", params.search);
        if (params.from) query.set("from", params.from);
        if (params.to) query.set("to", params.to);

        const response = await apiClient.getEnvelope(`/shipments?${query.toString()}`);
        const pagination = response.meta?.pagination ?? {
            page: params.page,
            pageSize: params.pageSize,
            total: 0,
            totalPages: 1,
        };

        return {
            items: (response.data ?? []) as Shipment[],
            pagination,
        };
    },
    getById: async (id: string): Promise<ShipmentDetail> => {
        return apiClient.get<ShipmentDetail>(`/shipments/${id}`);
    },
    create: async (shipment: CreateShipmentInput) => {
        return apiClient.post<CreatedShipment>("/shipments", shipment);
    },
    createWithOperational: async (payload: {
        shipment: CreateShipmentInput
        operational: Omit<CreateShipmentOperationalInput, "shipmentId">
    }) => {
        return apiClient.post<CreatedShipment>("/shipments/with-operational", payload);
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
    createShipmentOperationalAttachment: async (shipmentId: string, shipmentOperationalAttachment: FormData) => {
        const response = await apiClient.post(`/shipments/${shipmentId}/attachments`, shipmentOperationalAttachment);
        return response;
    },
    updateShipmentOperationalAttachment: async (shipmentId: string, id: string, shipmentOperationalAttachment: unknown) => {
        const response = await apiClient.put(`/shipments/${shipmentId}/attachments/${id}`, shipmentOperationalAttachment);
        return response;
    },
    deleteShipmentOperationalAttachment: async (shipmentId: string, id: string) => {
        const response = await apiClient.delete(`/shipments/${shipmentId}/attachments/${id}`);
        return response;
    },
    viewShipmentOperationalAttachment: async (shipmentId: string, id: string) => {
        await openFetchedAttachment(async () => {
            const response = await apiClient.get<{
                url: string
                contentType?: string | null
                fileName?: string | null
            }>(`/shipments/${shipmentId}/attachments/${id}`);
            return {
                url: response.url,
                contentType: response.contentType,
                fileName: response.fileName,
            };
        });
    }
}