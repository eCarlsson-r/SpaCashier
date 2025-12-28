"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "address", header: "Address" }
];

export default function BranchPage() {
    const router = useRouter();
    const { data, remove } = useModel('branch');

    return <DataTable
        title="Branch"
        columns={columns}
        tableAction={() => router.push("/master/branch/new")}
        data={data}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/branch/${item.id}`)}
    />;
}