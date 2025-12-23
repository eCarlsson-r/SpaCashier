"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({ form, name, value, onChange }: { form?: any; name?: string; value: Date; onChange: (value: string | undefined) => void }) {
    const dateValue = (form && name) ? form.watch(name) : value;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateValue && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateValue ? format(new Date(dateValue), "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={dateValue ? new Date(dateValue) : undefined}
                    onSelect={(date) => (form && name) ? form.setValue(name, date?.toISOString().split('T')[0]) : onChange(date?.toISOString().split('T')[0])}
                    initialFocus
                    // For Birthdays: allow users to navigate years easily
                    captionLayout="dropdown-years"
                    fromYear={1940}
                    toYear={new Date().getFullYear()}
                />
            </PopoverContent>
        </Popover>
    );
}