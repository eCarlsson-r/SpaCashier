"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { AppSelect } from "./AppSelect";

export function AccountSelect({ form, name, typeFilter = "all", placeholder = "Select account..." }: { form: any; name: string; label?: string; typeFilter?: string; placeholder?: string }) {
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
                    <FormControl>
                        <AppSelect
                            {...field} // This spreads value, onChange, onBlur
                            // Force a re-render by ensuring the value is strictly a string
                            value={String(field.value || "")}
                            onValueChange={(val) => {
                                // Ensure we send the value exactly as the form expects it
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