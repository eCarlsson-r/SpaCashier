import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
];

export default function AccountPage() {
    return <DataTable columns={columns} data={useMaster("account").data || []} searchKey="name" />;
}