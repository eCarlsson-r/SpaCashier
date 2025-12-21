"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "mobile", header: "Mobile Number" },
    { accessorKey: "email", header: "E-mail Address" },
];

export default function EmployeesPage() {
    const router = useRouter();
    return <DataTable
        title="Employees"
        columns={columns}
        data={useMaster("employee", false).data || []}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/employee/${item.id}`)}
    />;
}