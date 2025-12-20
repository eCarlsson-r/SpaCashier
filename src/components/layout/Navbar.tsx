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
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/ui/navigation-menu";

export function Navbar() {
    const menu = useAuthorizedMenu();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {menu.map((group) => (
                    <NavigationMenuItem key={group.category}>
                        <NavigationMenuTrigger className="bg-transparent">{group.category}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                {group.items.map((item) => (
                                    <li key={item.title}>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href={item.href}
                                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                            >
                                                <div className="text-sm font-medium leading-none">{item.title}</div>
                                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                                    Manage {item.title.toLowerCase()} data
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
    );
}