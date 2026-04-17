"use client";

import { useAuth } from "@/hooks/useAuth";
import { adminMenuConfig, staffMenuConfig, therapistMenuConfig } from "@/config/menu";
import { useTranslations } from "next-intl";

export function useAuthorizedMenu() {
    const { user } = useAuth();
    const t = useTranslations();

    const translateMenu = (menu: any[]) => {
        return menu.map(group => ({
            ...group,
            category: t(`nav.${group.category}`),
            items: group.items.map((item: any) => ({
                ...item,
                title: t(`nav.items.${item.title}`),
                description: t(`nav.descriptions.${item.description}`)
            }))
        }));
    };

    if (user) {
        if (user.type == "ADMIN") return translateMenu(adminMenuConfig);
        else if (user.type == "STAFF") return translateMenu(staffMenuConfig);
        else if (user.type == "THERAPIST") return translateMenu(therapistMenuConfig);
    } else return [];
}