"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "from_wallet_id", header: "From Wallet" },
    { accessorKey: "to_wallet_id", header: "To Wallet" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "description", header: "Description" },
];

export default function TransferPage() {
    const router = useRouter();
    return <DataTable
        title="Transfers"
        columns={columns}
        data={useModel("transfer", { mode: "table" }).data || []}
        searchKey="description"
        tableAction={() => router.push("/cashflow/transfer/new")}
        onRowClick={(item) => router.push(`/cashflow/transfer/${item.id}`)}
    />;
}