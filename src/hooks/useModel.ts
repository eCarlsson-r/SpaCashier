import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { ApiResourceType, ApiResourceData } from "@/lib/api-resources";
import { useRealtimeSync } from "./useRealtimeSync";

export function useModel<T extends ApiResourceType, R = ApiResourceData<T>>(entity: T | string, options: {
    params?: object,
    mode?: 'table' | 'select'
} = { mode: 'table' }) {
    const queryClient = useQueryClient();
    const baseEntity = entity.split('/')[0];

    const queryKey = [entity, options.params].filter(Boolean);

    useRealtimeSync({
        // When Reverb says "treatments" updated, invalidate this specific queryKey
        [baseEntity]: () => {
            console.log(`Realtime: Refreshing ${queryKey}`);
            queryClient.invalidateQueries({ queryKey });
        }
    });

    const { data: response, ...queryRest } = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const res = await api.get(`${entity}`, { params: options.params });
            return res?.data ?? [];
        },
    });

    const tableData = React.useMemo(() => {
        return Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
    }, [response]);

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => api.delete(`${baseEntity}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [entity] });
            toast.success(`${baseEntity} deleted successfully`);
        },
    });

    const selectOptions = React.useMemo(() => {
        if (options.mode !== 'select') return [];
        return tableData.map((item: {id: string, name: string, complete_name: string, label: string, value: string}) => ({
            label: item.name || item.complete_name || item.label || "Unknown",
            value: (item.id ?? item.value ?? "").toString(),
        }));
    }, [tableData, options.mode]);

    return {
        data: tableData as R[],
        options: selectOptions,
        remove: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        ...queryRest
    };
}