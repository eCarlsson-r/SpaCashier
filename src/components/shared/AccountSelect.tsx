"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ChevronsUpDown, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
                    {label && <FormLabel>{label}</FormLabel>}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        // Safety check: find account based on field.value
                                        accounts.find((acc: any) => acc.id?.toString() === field.value?.toString())?.name || placeholder
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search account..." />
                                <CommandList>
                                    <CommandEmpty>No account found.</CommandEmpty>
                                    <CommandGroup>
                                        {accounts.map((account: any) => (
                                            <CommandItem
                                                key={account.id}
                                                value={account.name} // for searching
                                                onSelect={() => {
                                                    form.setValue(name, account.id.toString());
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        account.id.toString() === field.value?.toString() ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[10px] font-bold text-slate-500 uppercase">
                                                        {account.category}
                                                    </span>
                                                    <span className="text-sm font-medium">{account.name}</span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}