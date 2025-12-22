"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";

const columns = [
    { accessorKey: "name", header: "Treatment Name" },
    { accessorKey: "category.name", header: "Category" },
    { accessorKey: "duration", header: "Duration" },
    { accessorKey: "price", header: "Price" },
];

export default function TreatmentPage() {
    const router = useRouter();
    return <DataTable
        title="Treatments"
        columns={columns}
        tableAction={() => router.push("/master/treatment/new")}
        data={useModel("treatment", { mode: "table" }).data}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/treatment/${item.id}`)}
    />;
}