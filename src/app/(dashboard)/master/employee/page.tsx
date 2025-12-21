"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "mobile", header: "Mobile Number" },
    { accessorKey: "email", header: "E-mail Address" },
];

export default function EmployeesPage() {
    return <DataTable title="Employees" columns={columns} data={useMaster("employee", false).data || []} searchKey="name" />;
}