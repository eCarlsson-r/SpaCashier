// src/hooks/use-master.ts
import { useQuery } from "@tanstack/react-query";
import { useBranch } from "@/hooks/useBranch";
import api from "@/lib/api";

export function useMaster(endpoint: string, isBranchScoped: boolean = true) {
    const { selectedBranchId } = useBranch();

    return useQuery({
        // The queryKey changes based on the endpoint (e.g., "banks" or "suppliers")
        queryKey: [endpoint, isBranchScoped ? selectedBranchId : "global"],
        queryFn: async () => {
            const params = isBranchScoped ? { branch_id: selectedBranchId } : {};
            const { data } = await api.get(`/${endpoint}`, { params });
            return data;
        },
        enabled: isBranchScoped ? !!selectedBranchId : true,
        staleTime: 1000 * 60 * 5, // 5 minutes default cache
    });
}