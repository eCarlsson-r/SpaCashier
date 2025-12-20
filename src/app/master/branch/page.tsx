import { DataTable } from "@/components/shared/DataTable";
import { useBranch } from "@/hooks/useBranch";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "address", header: "Address" }
];

export default function BranchPage() {
    return <DataTable columns={columns} data={useBranch().data?.data || []} searchKey="name" />;
}