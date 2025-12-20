import { DataTable } from "@/components/shared/DataTable";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "mobile", header: "Mobile Number" },
    { accessorKey: "email", header: "E-mail Address" },
];

export default function CustomerPage() {
    return <DataTable columns={columns} data={useCustomer().data?.data || []} searchKey="name" />;
}