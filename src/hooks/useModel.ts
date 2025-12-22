import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useModel(entity: string, options: {
    grade?: string,
    branchId?: string,
    mode?: 'table' | 'select'
} = { mode: 'table' }) {

    const { data: response, ...rest } = useQuery({
        queryKey: ['master', entity, options.branchId, options.grade],
        queryFn: async () => {
            const res = await api.get(`${entity}`, {
                params: { branch_id: options.branchId, grade: options.grade }
            });
            // If using Axios, the data is inside res.data
            // If using a custom wrapper, ensure you return the array here
            return res?.data ?? [];
        },
    });

    // Ensure we always return an array to the component, even while loading
    const tableData = Array.isArray(response) ? response : [];

    const selectOptions = React.useMemo(() => {
        if (options.mode !== 'select') return [];
        return tableData.map((item: any) => ({
            label: item.name || item.label || "Unknown",
            value: (item.id ?? item.value ?? "").toString(),
        }));
    }, [tableData, options.mode]);

    return {
        data: tableData,    // This is now safely an array
        options: selectOptions,
        ...rest
    };
}