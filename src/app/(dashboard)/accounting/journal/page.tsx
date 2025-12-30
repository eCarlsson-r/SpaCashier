"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "date", header: "Date", cell: ({row}) => (row.original.date)?new Date(row.original.date).toDateString():"" },
    { accessorKey: "reference", header: "Reference" },
    { accessorKey: "description", header: "Description" },
];

export default function JournalPage() {
    const router = useRouter();
    const { data, remove } = useModel('journal');
    return <DataTable
        title="Journals"
        columns={columns}
        tableAction={() => router.push("/accounting/journal/new")}
        data={data}
        searchKey="description"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/accounting/journal/${item.id}`)}
    />;
}