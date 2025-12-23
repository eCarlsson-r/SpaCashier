"use client";

import { AppSelect } from "@/components/shared/AppSelect";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModel } from "@/hooks/useModel";
import api from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";

interface BonusData {
    id: string;
    treatment_id: string;
    gross_bonus: number;
    trainer_deduction: number;
    savings_deduction: number;
    pendingGross?: string;
    pendingTrainer?: string;
    pendingSaving?: string;
}

export const getBonusColumns = (
    onUpdate: (id: string, data: any) => void,
    syncingId: string | null
): ColumnDef<BonusData>[] => [ // Ensure type is explicitly set here
        {
            accessorKey: "treatment_id",
            header: "Treatment",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <AppSelect
                        options={useModel("treatment", { mode: "select" }).options}
                        value={row.original.treatment_id}
                        onValueChange={(val) => onUpdate(row.original.id, { treatment_id: val })}
                    />
                </div>
            ),
        },
        {
            accessorKey: "gross_bonus",
            header: "Gross Bonus",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Rp.</span>
                    <Input
                        defaultValue={row.original.gross_bonus}
                        className="h-8 w-32"
                        // Update a temporary property on the row object
                        onChange={(e) => (row.original.pendingGross = e.target.value)}
                    />
                </div>
            ),
        },
        {
            accessorKey: "trainer_deduction",
            header: "Deduct for Trainer",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Rp.</span>
                    <Input
                        defaultValue={row.original.trainer_deduction}
                        className="h-8 w-32"
                        // Update a temporary property on the row object
                        onChange={(e) => (row.original.pendingTrainer = e.target.value)}
                    />
                </div>
            ),
        },
        {
            accessorKey: "savings_deduction",
            header: "Deduct to Savings",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Rp.</span>
                    <Input
                        defaultValue={row.original.savings_deduction}
                        className="h-8 w-32"
                        // Update a temporary property on the row object
                        onChange={(e) => (row.original.pendingSaving = e.target.value)}
                    />
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-sky-600"
                    disabled={syncingId === row.original.id}
                    onClick={() => onUpdate(row.original.id, {
                        gross_bonus: row.original.pendingGross || row.original.gross_bonus,
                        trainer_deduction: row.original.pendingTrainer || row.original.trainer_deduction,
                        savings_deduction: row.original.pendingSaving || row.original.savings_deduction,
                    })}
                >
                    {syncingId === row.original.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            ),
        },
    ];

export default function BonusPage() {
    const [selectedGrade, setSelectedGrade] = useState("A");

    const { data: bonusData } = useModel("bonus", {
        grade: selectedGrade,
        mode: "table"
    });

    const [syncingId, setSyncingId] = useState<string | null>(null);

    const handleSingleUpdate = async (id: string, updatedData: any) => {
        setSyncingId(id);
        try {
            await api.put(`/bonus/${id}`, updatedData);
        } finally {
            setSyncingId(null);
        }
    };

    return <DataTable
        title="Bonus"
        columns={getBonusColumns(handleSingleUpdate, syncingId)}
        data={bonusData}
        customFilter={
            <div className="flex items-center gap-2" >
                <span className="text-sm font-medium">Grade</span>
                <div className="w-[200px]">
                    <AppSelect
                        options={[
                            { value: "A", label: "A" },
                            { value: "B", label: "B" },
                            { value: "C", label: "C" },
                            { value: "D", label: "D" },
                            { value: "E", label: "E" }
                        ]}
                        value={selectedGrade}
                        onValueChange={(val) => setSelectedGrade(val)}
                    />
                </div>
            </div>
        }
    />;
}