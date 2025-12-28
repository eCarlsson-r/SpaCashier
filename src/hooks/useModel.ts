import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { ApiResourceType, ApiResourceData } from "@/lib/api-resources";

export function useModel<T extends ApiResourceType>(entity: T | string, options: {
    grade?: string,
    status?: string,
    show?: string,
    branchId?: string,
    week?: string,
    period_id?: string,
    employee_id?: string,
    start_date?: string,
    end_date?: string,
    mode?: 'table' | 'select'
} = { mode: 'table' }) {
    const queryClient = useQueryClient();
    const baseEntity = entity.split('/')[0];

    const queryKey = [entity, options.grade, options.status, options.show, options.branchId, options.week].filter(Boolean);

    const { data: response, ...queryRest } = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const params: any = { branch_id: options.branchId };
            if (options.grade) params.grade = options.grade;
            if (options.status) params.status = options.status;
            if (options.show) params.show = options.show;
            if (options.week) params.week = options.week;
            if (options.period_id) params["period_id"] = options.period_id;
            if (options.employee_id) params["employee_id"] = options.employee_id;
            if (options.start_date) params["start_date"] = options.start_date.toDateString();
            if (options.end_date) params["end_date"] = options.end_date.toDateString();

            const res = await api.get(`${entity}`, { params });
            return res?.data ?? [];
        },
    });

    const tableData = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => api.delete(`${baseEntity}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [entity] });
            toast.success(`${baseEntity} deleted successfully`);
        },
    });

    const selectOptions = React.useMemo(() => {
        if (options.mode !== 'select') return [];
        return tableData.map((item: any) => ({
            label: item.name || item.complete_name || item.label || "Unknown",
            value: (item.id ?? item.value ?? "").toString(),
        }));
    }, [tableData, options.mode]);

    return {
        data: tableData as ApiResourceData<T>[],
        options: selectOptions,
        remove: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        ...queryRest
    };
}