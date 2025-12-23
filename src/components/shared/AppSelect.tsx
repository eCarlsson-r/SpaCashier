import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure this path matches your project structure
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface AppSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: { label: string; value: string | number }[];
    placeholder?: string;
    multiple?: boolean;
    disabled?: boolean;
}

export function AppSelect({
    value,
    onValueChange,
    options,
    placeholder = "Select option...",
    multiple = false,
    disabled = false
}: AppSelectProps) {
    const [open, setOpen] = React.useState(false);

    // 1. Pre-parse values for the entire list to avoid repetitive parsing in the loop
    const selectedValues = React.useMemo(() => {
        if (!multiple) return [];
        try {
            return JSON.parse(value || "[]");
        } catch {
            return [];
        }
    }, [value, multiple]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {multiple ? (
                        selectedValues.length > 0
                            ? `${selectedValues.length} selected`
                            : placeholder
                    ) : (
                        options?.find((opt) => opt.value?.toString() === value)?.label || placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                        {options?.map((option) => {
                            const optionValue = option?.value?.toString() ?? "";
                            const currentValue = value?.toString() ?? "";

                            const isSelected = multiple
                                ? selectedValues.includes(optionValue)
                                : currentValue === optionValue;

                            return (
                                <CommandItem
                                    key={optionValue}
                                    value={option.label}
                                    onSelect={() => {
                                        if (multiple) {
                                            try {
                                                const values = JSON.parse(value || "[]");
                                                const nextValues = values.includes(optionValue)
                                                    ? values.filter((v: string) => v !== optionValue)
                                                    : [...values, optionValue];

                                                onValueChange(JSON.stringify(nextValues));
                                            } catch (error) {
                                                onValueChange(JSON.stringify([optionValue]));
                                            }
                                        } else {
                                            onValueChange(optionValue);
                                            setOpen(false);
                                        }
                                    }}
                                >
                                    {/* 3. The Check icon uses 'cn' and 'isSelected' */}
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}