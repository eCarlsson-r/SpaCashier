import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useModel(entity: string, options: {
    grade?: string,
    status?: string,
    show?: string,
    branchId?: string,
    week?: string,
    mode?: 'table' | 'select'
} = { mode: 'table' }) {
    let queryKey = [entity];
    if (options.grade) queryKey.push(options.grade);
    if (options.status) queryKey.push(options.status);
    if (options.show) queryKey.push(options.show);
    if (options.branchId) queryKey.push(options.branchId);
    if (options.week) queryKey.push(options.week);
    const { data: response, ...rest } = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            let params: any = { branch_id: options.branchId };
            if (options.grade) params.grade = options.grade;
            if (options.status) params.status = options.status;
            if (options.show) params.show = options.show;
            if (options.week) params.week = options.week;
            const res = await api.get(`${entity}`, {
                params: params
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