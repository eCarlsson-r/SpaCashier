"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AppSelect } from "./AppSelect";
import z from "zod";
import { AccountSchema } from "@/lib/schemas";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export function AccountSelect<T extends FieldValues>({
  form,
  name,
  label,
  typeFilter = "all",
  placeholder = "Select account...",
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  typeFilter?: string;
  placeholder?: string;
}) {
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts-lookup", typeFilter],
    queryFn: async () => {
      const res = await api.get("/account/lookup", {
        params: { type: typeFilter },
      });
      return res.data;
    },
  });

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <AppSelect
              {...field}
              value={String(field.value || "")}
              onValueChange={(val) => {
                field.onChange(val);
              }}
              options={accounts.map((acc: z.infer<typeof AccountSchema>) => ({
                label: acc.name,
                value: String(acc.id),
              }))}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
