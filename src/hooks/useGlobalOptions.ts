// src/hooks/useGlobalOptions.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useGlobalOptions() {
    return useQuery({
        queryKey: ["global-options"],
        queryFn: async () => {
            // Your Laravel endpoint: Route::get('/api/options', OptionsController::class)
            const { data } = await api.get("/api/options");
            return data;
        },
        // Keep data fresh for 5 minutes so users don't see loading spinners 
        // when switching between Appointment and Sales forms
        staleTime: 5 * 60 * 1000,
    });
}