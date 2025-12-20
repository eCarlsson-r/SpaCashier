import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Option {
    value: string | number;
    label: string;
}

interface AppSelectProps {
    options: Option[];
    placeholder?: string;
    value?: string;
    onValueChange: (value: string) => void;
}

export function AppSelect({ options, placeholder, value, onValueChange }: AppSelectProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}