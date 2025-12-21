"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "journal_reference", header: "Reference" },
    { accessorKey: "partner", header: "Cash Partner" },
    { accessorKey: "description", header: "Description" },
];

export default function ExpensePage() {
    return <DataTable title="Expenses" columns={columns} data={useMaster("expense", false).data || []} searchKey="description" />;
}