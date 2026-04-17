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

export function Navbar() {
    const menu = useAuthorizedMenu();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {menu?.map((group) => (
                    <NavigationMenuItem key={group.category}>
                        <NavigationMenuTrigger className="bg-transparent text-white">{group.category}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
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
    );
}