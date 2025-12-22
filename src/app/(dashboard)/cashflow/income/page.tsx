"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";

const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "journal_reference", header: "Reference" },
    { accessorKey: "partner", header: "Cash Partner" },
    { accessorKey: "description", header: "Description" },
];

export default function IncomePage() {
    return <DataTable title="Income" columns={columns} data={useModel("income", false).data || []} searchKey="description" />;
}