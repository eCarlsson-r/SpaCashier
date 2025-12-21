"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useMaster } from "@/hooks/useMaster";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "treatment.name", header: "Treatment" },
    { accessorKey: "gross_bonus", header: "Bonus Kotor" },
    { accessorKey: "trainer_deduction", header: "Pot/u Trainer" },
    { accessorKey: "savings_deduction", header: "Pot/u Tabgn" }
];

export default function BonusPage() {
    const router = useRouter();
    return <DataTable
        title="Bonus"
        columns={columns}
        data={useMaster("bonus", false).data || []}
        searchKey="grade"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => console.info(item)}
    />;
}