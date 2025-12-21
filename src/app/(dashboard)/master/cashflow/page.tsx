"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const bankColumns = [
    { accessorKey: "name", header: "Name" }
];

const walletColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "bank_id", header: "Bank" },
    { accessorKey: "bank_account_number", header: "Bank Account Number" },
];

export default function CashflowPage() {
    return (
        <>
            <DataTable title="Banks" columns={bankColumns} data={useMaster("bank", false).data || []} searchKey="name" />
            <DataTable title="Wallets" columns={walletColumns} data={useMaster("wallet", false).data || []} searchKey="name" />
        </>
    );
}