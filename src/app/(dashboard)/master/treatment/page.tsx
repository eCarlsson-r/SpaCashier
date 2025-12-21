"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Treatment Name" },
    { accessorKey: "category.name", header: "Category" },
    { accessorKey: "duration", header: "Duration" },
    { accessorKey: "price", header: "Price" },
];

export default function TreatmentPage() {
    return <DataTable title="Treatments" columns={columns} data={useMaster("treatment", false).data || []} searchKey="name" />;
}