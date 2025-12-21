// src/providers/branch-provider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface BranchContextType {
    selectedBranchId: number | null;
    setSelectedBranchId: (id: number) => void;
    currentBranchName: string;
}

export const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

    // Default to the user's assigned branch from Laravel
    useEffect(() => {
        if (user?.employee?.branch_id && !selectedBranchId) {
            setSelectedBranchId(user.employee.branch_id);
        }
    }, [user, selectedBranchId]);

    const currentBranchName = user?.branches?.find(b => b.id === selectedBranchId)?.name || "Select Branch";

    return (
        <BranchContext.Provider value={{ selectedBranchId, setSelectedBranchId, currentBranchName }}>
            {children}
        </BranchContext.Provider>
    );
}