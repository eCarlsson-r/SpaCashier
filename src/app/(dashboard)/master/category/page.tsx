"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useMaster } from "@/hooks/useMaster";
import { useRouter } from "next/navigation";

const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
];

export default function CategoryPage() {
    const router = useRouter();
    return <DataTable
        title="Categories"
        columns={columns}
        data={useMaster("category", false).data || []}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/category/${item.id}`)}
    />;
}