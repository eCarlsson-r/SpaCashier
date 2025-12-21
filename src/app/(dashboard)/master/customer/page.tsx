"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useMaster } from "@/hooks/useMaster";
import { useRouter } from "next/navigation";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "mobile", header: "Mobile Number" },
    { accessorKey: "email", header: "E-mail Address" },
];

export default function CustomerPage() {
    const router = useRouter();
    return <DataTable
        title="Customers"
        columns={columns}
        data={useMaster("customer", false).data || []}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/customer/${item.id}`)}
    />;
}