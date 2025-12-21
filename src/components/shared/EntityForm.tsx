// src/components/master/shared/entity-form.tsx
"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/api";
import { Form } from "@/components/ui/form";
import { FormWrapper } from "./FormWrapper";

interface EntityFormProps {
    id?: string;
    endpoint: string;
    schema: any;
    defaultValues: any;
    children: (form: UseFormReturn<any>) => React.ReactNode;
    title: string;
}

export function EntityForm({ id, endpoint, schema, defaultValues, children, title }: EntityFormProps) {
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    // 1. Fetch data for Edit Mode
    const { data, isLoading } = useQuery({
        queryKey: [endpoint, id],
        queryFn: () => api.get(`${endpoint}/${id}`).then((res) => res.data),
        enabled: isEdit,
    });

    // 2. Sync data to form fields
    useEffect(() => {
        if (data) {
            // We loop through the data to ensure numbers become strings 
            // so the HTML inputs don't complain
            const formattedData = { ...data };
            Object.keys(formattedData).forEach(key => {
                if (typeof formattedData[key] === 'number') {
                    formattedData[key] = formattedData[key].toString();
                }
            });
            form.reset(formattedData);
        }
    }, [data, form]);

    // 3. Unified Mutation (POST or PUT)
    const mutation = useMutation({
        mutationFn: (values: any) => {
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (value instanceof FileList && value.length > 0) {
                    formData.append(key, value[0]); // Append the actual file
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value as string);
                }
            });

            if (isEdit) formData.append("_method", "PUT");
            return isEdit
                ? api.put(`${endpoint}/${id}`, formData)
                : api.post(endpoint, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [endpoint] });
            // Redirect or show success toast
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
                <FormWrapper
                    title={title}
                    isLoading={isEdit && isLoading}
                    onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
                >
                    {children(form)}
                </FormWrapper>
            </form>
        </Form>
    );
}