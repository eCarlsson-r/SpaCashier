"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";

const columns = [
    { accessorKey: "name", header: "Supplier Name" },
    { accessorKey: "address", header: "Supplier Address" },
    { accessorKey: "mobile", header: "Supplier Mobile" },
    { accessorKey: "email", header: "Supplier Email" },
];

export default function SupplierPage() {
    const router = useRouter();
    const { data, remove } = useModel('supplier');
    return <DataTable
        title="Suppliers"
        columns={columns}
        tableAction={() => router.push("/master/supplier/new")}
        data={data}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/supplier/${item.id}`)}
    />;
}