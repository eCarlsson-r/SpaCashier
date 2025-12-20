import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "percent", header: "Discount %" },
    { accessorKey: "amount", header: "Discount Rp." },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "expiry_date", header: "Expiry Date" },
];

export default function DiscountPage() {
    return <DataTable columns={columns} data={useMaster("discount").data || []} searchKey="name" />;
}