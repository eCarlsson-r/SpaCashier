"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/providers/locale-provider";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
    const { locale, switchLocale } = useLocale();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Languages className="h-4 w-4 mr-2" />
                    {locale.toUpperCase()}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => switchLocale('en')} disabled={locale === 'en'}>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale('id')} disabled={locale === 'id'}>
                    Bahasa Indonesia
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}