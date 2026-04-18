"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthorizedMenu } from "@/hooks/useAuthorizedMenu";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger
} from "@/ui/navigation-menu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger as DpTrigger,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const menu = useAuthorizedMenu();

    return (
        <>
            {/* Desktop Menu */}
            <div className="hidden md:block">
                <NavigationMenu>
                    <NavigationMenuList>
                        {menu?.map((group) => (
                            <NavigationMenuItem key={group.category}>
                                <NavigationMenuTrigger className="bg-transparent text-white">{group.category}</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[calc(100vw-2rem)] sm:w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                        {group.items.map((item: { title: string; href: string; description: string }) => (
                                            <li key={item.title}>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href={item.href}
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                    >
                                                        <div className="text-sm font-medium leading-none">{item.title}</div>
                                                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                                            {item.description}
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Mobile Menu */}
            <div className="block md:hidden">
                <DropdownMenu>
                    <DpTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-sky-700">
                            <Menu size={24} />
                        </Button>
                    </DpTrigger>
                    <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto">
                        {menu?.map((group, index) => (
                            <React.Fragment key={group.category}>
                                {index > 0 && <DropdownMenuSeparator />}
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-sky-700">{group.category}</DropdownMenuLabel>
                                    {group.items.map((item: { title: string; href: string; description: string }) => (
                                        <DropdownMenuItem key={item.title} asChild>
                                            <Link href={item.href} className="w-full cursor-pointer flex-col items-start gap-1 p-3">
                                                <div className="text-sm font-medium">{item.title}</div>
                                                <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </React.Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}