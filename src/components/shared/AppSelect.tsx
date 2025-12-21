import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface Option {
    value: string | number;
    label: string;
}

interface AppSelectProps {
    options: Option[];
    placeholder?: string;
    value?: string;
    onValueChange: (value: string) => void;
    isLoading?: boolean;
}

export function AppSelect({ options, placeholder, value, onValueChange, isLoading }: AppSelectProps) {
    const [open, setOpen] = useState(false);
    return (
        <div className="space-y-2 flex flex-col">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="justify-between font-normal">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                            value ? options.find((option) => option.value === value)?.label : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search..." />
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onValueChange(option.value.toString());
                                    }}
                                >
                                    <div className="flex items-center w-full gap-3">
                                        <span className="text-sm font-medium truncate">
                                            {option.label}
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