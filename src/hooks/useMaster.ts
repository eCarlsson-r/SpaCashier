import { useQuery } from "@tanstack/react-query";
import { useBranch } from "@/hooks/useBranch";
import api from "@/lib/api";

export const useCustomers = () => {
    const { selectedBranchId } = useBranch();
    return useQuery({
        queryKey: ["customer", selectedBranchId],
        queryFn: () => api.get(`/customer?branch_id=${selectedBranchId}`).then(res => res.data),
        staleTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    });
};

export const useTreatments = () => {
    return useQuery({
        queryKey: ["treatment"],
        queryFn: () => api.get("/treatment").then(res => res.data),
    });
};

export const useDiscounts = () => {
    return useQuery({
        queryKey: ["discount"],
        queryFn: () => api.get("/discount").then(res => res.data),
    });
};

export const useWallets = () => {
    return useQuery({
        queryKey: ["wallet"],
        queryFn: () => api.get("/wallet").then(res => res.data),
    });
};

export const useBanks = () => {
    return useQuery({
        queryKey: ["bank"],
        queryFn: () => api.get("/bank").then(res => res.data),
    });
};