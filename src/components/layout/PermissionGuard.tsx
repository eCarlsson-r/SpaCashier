"use client";

import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";

export function PermissionGuard({
    permission,
    children
}: {
    permission: string;
    children: React.ReactNode
}) {
    const { user, loading } = useAuth();

    if (loading) return <div>Checking access...</div>;

    if (!user?.permissions.includes(permission)) {
        redirect("/dashboard"); // Or a "Not Authorized" page
    }

    return <>{children}</>;
}