"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TransferSchema } from "@/lib/schemas";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

const columns: ColumnDef<z.infer<typeof TransferSchema>>[] = [
    { accessorKey: "date", header: "Date", cell: (info) => (info.getValue())?new Date(info.getValue() as string).toDateString():"" },
    { accessorKey: "from_wallet_id", header: "From Wallet" },
    { accessorKey: "to_wallet_id", header: "To Wallet" },
    { accessorKey: "amount", header: "Amount", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-` },
    { accessorKey: "description", header: "Description" },
];

export default function TransferPage() {
    const router = useRouter();
    const { data, remove } = useModel('transfer');
    return <DataTable
        title="Transfers"
        columns={columns}
        data={data}
        searchKey="description"
        tableAction={() => router.push("/cashflow/transfer/new")}
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/cashflow/transfer/${item.id}`)}
    />;
}