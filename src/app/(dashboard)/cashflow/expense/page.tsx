"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "journal_reference", header: "Reference" },
    { accessorKey: "partner", header: "Cash Partner" },
    { accessorKey: "description", header: "Description" },
];

export default function ExpensePage() {
    const router = useRouter();
    return <DataTable
        title="Expenses"
        columns={columns}
        data={useModel("expense", { mode: "table" }).data || []}
        searchKey="description"
        tableAction={() => router.push("/cashflow/expense/new")}
        onRowClick={(item) => router.push(`/cashflow/expense/${item.id}`)}
    />;
}