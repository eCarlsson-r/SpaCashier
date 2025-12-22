"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";

const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "reference", header: "Reference" },
    { accessorKey: "description", header: "Description" },
];

export default function JournalPage() {
    return <DataTable title="Journals" columns={columns} data={useModel("journal", false).data || []} searchKey="description" />;
}