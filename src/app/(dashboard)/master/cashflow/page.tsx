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
            <DataTable columns={bankColumns} data={useMaster("bank").data || []} searchKey="name" />
            <DataTable columns={walletColumns} data={useMaster("wallet").data || []} searchKey="name" />
        </>
    );
}