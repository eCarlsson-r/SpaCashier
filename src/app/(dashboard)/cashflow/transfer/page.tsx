"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "from_wallet_id", header: "From Account" },
    { accessorKey: "to_wallet_id", header: "To Account" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "description", header: "Description" },
];

export default function TransferPage() {
    return <DataTable title="Transfers" columns={columns} data={useMaster("transfer", false).data || []} searchKey="description" />;
}