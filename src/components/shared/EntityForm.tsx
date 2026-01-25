// src/components/master/shared/entity-form.tsx
"use client";

import {
  useForm,
  UseFormReturn,
  FieldValues,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/api";
import { Form } from "@/components/ui/form";
import { FormWrapper } from "./FormWrapper";

interface EntityFormProps<TData extends FieldValues> {
  id?: string;
  endpoint: string;
  schema: any;
  defaultValues: DefaultValues<TData>;
  children: (form: UseFormReturn<TData>) => React.ReactNode;
  title: string;
}

export function EntityForm<TData extends FieldValues>({
  id,
  endpoint,
  schema,
  defaultValues,
  children,
  title,
}: EntityFormProps<TData>) {
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const form = useForm<TData>({
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
      Object.keys(formattedData).forEach((key) => {
        if (typeof formattedData[key] === "number") {
          formattedData[key] = formattedData[key].toString();
        }
      });
      // Cast formattedData to DefaultValues<TData> or any if structure matches
      form.reset(formattedData as DefaultValues<TData>);
    }
  }, [data, form]);

  // 3. Unified Mutation (POST or PUT)
  const mutation = useMutation({
    mutationFn: (values: FieldValues) => {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        // Handle standard React Hook Form file registration
        if (value instanceof FileList) {
          if (value.length > 0) {
            formData.append(key, value[0]); // Extract the actual file
          }
        }
        // Handle manual file sets (from ImagePreview)
        else if (value instanceof File) {
          formData.append(key, value);
        }
        // Handle all other fields
        else if (value !== null && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      // Laravel Method Spoofing
      if (isEdit) formData.append("_method", "PUT");

      return api.post(isEdit ? `${endpoint}/${id}` : endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      // Redirect or show success toast
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
        <FormWrapper title={title} isLoading={isEdit && isLoading}>
          {children(form)}
        </FormWrapper>
      </form>
    </Form>
  );
}
