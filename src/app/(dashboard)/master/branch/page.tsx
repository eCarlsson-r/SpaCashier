"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useMaster } from "@/hooks/useMaster";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "address", header: "Address" }
];

export default function BranchPage() {
    const router = useRouter();
    return <DataTable
        title="Branch"
        columns={columns}
        data={useMaster("branch", false).data || []}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/branch/${item.id}`)}
    />;
}