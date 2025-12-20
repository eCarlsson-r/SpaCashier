import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Agent Name" },
    { accessorKey: "address", header: "Agent Address" },
    { accessorKey: "phone", header: "Agent Phone" },
    { accessorKey: "mobile", header: "Agent Mobile" },
    { accessorKey: "email", header: "Agent Email" },
];

export default function SalesAgentPage() {
    return <DataTable columns={columns} data={useMaster("agents").data || []} searchKey="name" />;
}