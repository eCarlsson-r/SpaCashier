"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useMaster } from "@/hooks/useMaster";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "category", header: "Category" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" }
];

export default function AccountPage() {
    const router = useRouter();
    return <DataTable
        title="Accounts"
        columns={columns}
        data={useMaster("account", false).data || []}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/account/${item.id}`)}
    />;
}