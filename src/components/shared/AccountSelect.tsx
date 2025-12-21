// src/components/shared/account-select.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface Account {
    id: number | string;
    name: string;
    type: string;
    category: string;
}

export function AccountSelect({ form, name, label, typeFilter = "all", placeholder = "Select account..." }: { form: any; name: string; label?: string; typeFilter?: string; placeholder?: string }) {
    const [open, setOpen] = useState(false);

    const { data: accounts = [], isLoading } = useQuery({
        // Adding typeFilter to the key creates a unique cache for each type
        queryKey: ["accounts-lookup", typeFilter],
        queryFn: async () => {
            const res = await api.get("/account/lookup", {
                params: { type: typeFilter }
            });
            return res.data;
        },
    });

    const selectedValue = form.watch(name);
    const selectedAccount = accounts.find(
        (acc: Account) => acc.id.toString() === selectedValue?.toString()
    );

    return (
        <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">{label}</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="justify-between font-normal">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            selectedValue ? selectedAccount?.name : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search account name or number..." />
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                            {accounts.map((account: Account) => (
                                <CommandItem
                                    key={account.id}
                                    onSelect={() => {
                                        form.setValue(name, account.id.toString());
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-center w-full gap-3">
                                        {/* The Category Badge */}
                                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                                            {account.category}
                                        </span>

                                        {/* The Clean Name */}
                                        <span className="text-sm font-medium truncate">
                                            {account.name}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}