"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";

const columns = [
    { accessorKey: "name", header: "Agent Name" },
    { accessorKey: "address", header: "Agent Address" },
    { accessorKey: "phone", header: "Agent Phone" },
    { accessorKey: "mobile", header: "Agent Mobile" },
    { accessorKey: "email", header: "Agent Email" },
];

export default function SalesAgentPage() {
    const router = useRouter();
    const { data, remove } = useModel('agent');
    return <DataTable
        title="Sales Agents"
        columns={columns}
        tableAction={() => router.push("/master/salesagent/new")}
        data={data}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/salesagent/${item.id}`)}
    />;
}