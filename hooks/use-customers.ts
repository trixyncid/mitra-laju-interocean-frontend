import { Customer } from "@/app/dashboard/customers/columns";
import { customersService } from "@/services/customers.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCustomers = () => {
    return useQuery({
        queryKey: ["customers"],
        queryFn: customersService.getAll,
    })
}

export const useCustomerById = (id: string) => {
    return useQuery({
        queryKey: ["customers", id],
        queryFn: () => customersService.getById(id),
    })
}

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: customersService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast.success("Customer created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, customer }: { id: string, customer: Partial<Customer> }) => customersService.update(id, customer),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast.success("Customer updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}

export const useCreateCustomerLocation = (customerId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ customerId, location }: { customerId: string, location: unknown }) => customersService.createLocation(customerId, location),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
            toast.success("Customer location created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    })
}