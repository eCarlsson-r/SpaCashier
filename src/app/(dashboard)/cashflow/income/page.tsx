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

export default function IncomePage() {
    const router = useRouter();
    return <DataTable
        title="Income"
        columns={columns}
        data={useModel("income", { mode: "table" }).data || []}
        searchKey="description"
        tableAction={() => router.push("/cashflow/income/new")}
        onRowClick={(item) => router.push(`/cashflow/income/${item.id}`)}
    />;
}