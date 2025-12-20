import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "address", header: "Address" }
];

export default function BranchPage() {
    return <DataTable columns={columns} data={useMaster("branch").data || []} searchKey="name" />;
}