"use client"
import { useContext } from "react";
import { BranchContext } from "@/providers/branch-provider";

export const useBranch = () => {
    const context = useContext(BranchContext);
    if (!context) {
        throw new Error("useBranch must be used within a BranchProvider");
    }
    return context;
};