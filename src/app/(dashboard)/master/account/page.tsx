"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "category", header: "Category" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" }
];

export default function AccountPage() {
    const router = useRouter();
    const { data, remove } = useModel('account');

    return <DataTable
        title="Accounts"
        columns={columns}
        tableAction={() => router.push("/master/account/new")}
        data={data}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/account/${item.id}`)}
    />;
}