import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "mobile", header: "Mobile Number" },
    { accessorKey: "email", header: "E-mail Address" },
];

export default function CustomerPage() {
    return <DataTable columns={columns} data={useMaster("customer").data || []} searchKey="name" />;
}