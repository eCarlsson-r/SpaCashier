"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { AppSelect } from "./AppSelect";

export function AccountSelect({ form, name, label, typeFilter = "all", placeholder = "Select account..." }: { form: any; name: string; label?: string; typeFilter?: string; placeholder?: string }) {
    const [open, setOpen] = useState(false);

    const { data: accounts = [], isLoading } = useQuery({
        queryKey: ["accounts-lookup", typeFilter],
        queryFn: async () => {
            const res = await api.get("/account/lookup", { params: { type: typeFilter } });
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
                            options={accounts.map((acc: any) => ({
                                label: acc.name,
                                value: String(acc.id)
                            }))}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}