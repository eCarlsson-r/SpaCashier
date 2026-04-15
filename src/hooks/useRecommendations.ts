// src/hooks/useRecommendations.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { TreatmentRecommendation } from "@/lib/types";

/**
 * Fetches AI treatment recommendations for a customer at the POS.
 * Errors are treated silently — the panel is hidden, no error is shown.
 * Requirements: 2.1, 2.2, 2.5
 */
export function useRecommendations(customerId: string | number | null | undefined, branchId: string | number | null | undefined) {
    const enabled = !!customerId && !!branchId;

    const query = useQuery<TreatmentRecommendation[]>({
        queryKey: ["recommendations", "pos", customerId, branchId],
        queryFn: async () => {
            const { data } = await api.get("/ai/recommendations/pos", {
                params: { "customer_id": customerId, "branch_id": branchId },
            });
            return data;
        },
        enabled,
        retry: false,          // Do not retry on failure — fail silently
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        data: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
