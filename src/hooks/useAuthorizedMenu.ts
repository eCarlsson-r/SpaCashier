"use client";

import { useAuth } from "@/hooks/useAuth";
import { adminMenuConfig, staffMenuConfig, therapistMenuConfig } from "@/config/menu";

export function useAuthorizedMenu() {
    const { user } = useAuth();

    if (user) {
        if (user.type == "ADMIN") return adminMenuConfig;
        else if (user.type == "STAFF") return staffMenuConfig;
        else if (user.type == "THERAPIST") return therapistMenuConfig;
    } else return [];
}