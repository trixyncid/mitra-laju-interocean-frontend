import { Customer } from "@/app/dashboard/customers/columns";
import { customersService, type CustomerListParams } from "@/services/customers.service";
import type { CustomerDetail } from "@/lib/types/entity-details";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export const useCustomers = (params: CustomerListParams, enabled = true) => {
    return useQuery({
        queryKey: customerKeys.list(params),
        queryFn: () => customersService.getAll(params),
        enabled,
    })
}

export const useCustomerById = (id: string) => {
    return useQuery({
        queryKey: customerKeys.detail(id),
        queryFn: () => customersService.getById(id),
        enabled: !!id,
    })
}

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: customersService.create as (
            customer: Partial<Customer>
        ) => Promise<Customer>,
        onSuccess: (data) => {
            if (data?.id) {
                queryClient.setQueryData(customerKeys.detail(data.id), data)
            }
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer created successfully");
        },
    })
}

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, customer }: { id: string, customer: Partial<Customer> }) => customersService.update(id, customer),
        onSuccess: (data, { id }) => {
            queryClient.setQueryData<CustomerDetail>(customerKeys.detail(id), (existing) =>
                existing ? { ...existing, ...data } : data
            )
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer updated successfully");
        },
    })
}

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: customersService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer deleted successfully");
        },
    })
}


// Customer Shippers
export const useCreateCustomerShipper = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, shipper }: { customerId: string, shipper: unknown }) => customersService.createShipper(customerId, shipper),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer shipper created successfully");
        },
    })
}

export const useUpdateCustomerShipper = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, shipperId, shipper }: { customerId: string, shipperId: string, shipper: unknown }) => customersService.updateShipper(customerId, shipperId, shipper),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer shipper updated successfully");
        },
    })
}

export const useDeleteCustomerShipper = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, shipperId }: { customerId: string, shipperId: string }) => customersService.deleteShipper(customerId, shipperId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer shipper deleted successfully");
        },
    })
}

// Customer Locations
export const useCreateCustomerLocation = (customerId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ customerId, shipperId, location }: { customerId: string, shipperId: string, location: unknown }) => customersService.createLocation(customerId, shipperId, location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
            toast.success("Customer location created successfully");
        },
    })
}

export const useUpdateCustomerLocation = (customerId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, shipperId, locationId, location }: { customerId: string, shipperId: string, locationId: string, location: unknown }) => customersService.updateLocation(customerId, shipperId, locationId, location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
            toast.success("Customer location updated successfully");
        },
    })
}

export const useDeleteCustomerLocation = (customerId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ customerId, shipperId, locationId }: { customerId: string, shipperId: string, locationId: string }) => customersService.deleteLocation(customerId, shipperId, locationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
            toast.success("Customer location deleted successfully");
        },
    })
}

export const useGetLocationsByCustomerId = (
    customerId: string,
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: customerKeys.locations(customerId),
        queryFn: () => customersService.getLocationsByCustomerId(customerId),
        enabled: !!customerId && (options?.enabled ?? true),
    })
}

// Customer Contacts
export const useCreateCustomerContact = (customerId: string, shipperId: string, locationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contact }: { contact: unknown }) => customersService.createContact(customerId, shipperId, locationId, contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
            toast.success("Customer contact created successfully");
        },
    })
}

export const useUpdateCustomerContact = (customerId: string, shipperId: string, locationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contactId, contact }: { contactId: string, contact: unknown }) => customersService.updateContact(customerId, shipperId, locationId, contactId, contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
            toast.success("Customer contact updated successfully");
        },
    })
}

export const useDeleteCustomerContact = (customerId: string, shipperId: string, locationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contactId }: { contactId: string }) => customersService.deleteContact(customerId, shipperId, locationId, contactId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
            toast.success("Customer contact deleted successfully");
        },
    })
}

export const useGetShippersByCustomerCodeId = (customerId: string) => {
    return useQuery({
        queryKey: customerKeys.shippers(customerId),
        queryFn: () => customersService.getShippersByCustomerCodeId(customerId),
        enabled: !!customerId,
    })
}