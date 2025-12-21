"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "percent", header: "Discount %" },
    { accessorKey: "amount", header: "Discount Rp." },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "expiry_date", header: "Expiry Date" },
];

export default function DiscountPage() {
    const router = useRouter();
    return <DataTable
        title="Discounts"
        columns={columns}
        data={useMaster("discount", false).data || []}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/discount/${item.id}`)}
    />;
}