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
  CommandList,
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
  disabled = false,
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

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v: string) => v !== optionValue)
        : [...selectedValues, optionValue];
      onValueChange(JSON.stringify(newValues));
    } else {
      onValueChange(optionValue);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between"
        >
          {multiple
            ? selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholder
            : options?.find((opt) => opt.value?.toString() === value)?.label ||
              placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width] overflow-hidden">
        <Command>
          <CommandInput placeholder="Search..." />

          <CommandList className="max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(
                (option: { label: string; value: string | number }) => {
                  const isSelected = multiple
                    ? selectedValues.includes(option.value.toString())
                    : value === option.value.toString();

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(option.value.toString())}
                      className="flex items-center justify-between py-3 px-3 cursor-pointer"
                    >
                      <span className="truncate">{option.label}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                },
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
