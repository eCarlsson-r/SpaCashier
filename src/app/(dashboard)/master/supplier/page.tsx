import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Supplier Name" },
    { accessorKey: "address", header: "Supplier Address" },
    { accessorKey: "mobile", header: "Supplier Mobile" },
    { accessorKey: "email", header: "Supplier Email" },
];

export default function SupplierPage() {
    return <DataTable columns={columns} data={useMaster("suppliers").data || []} searchKey="name" />;
}