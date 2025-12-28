"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
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
    const { data, remove } = useModel('discount');

    return <DataTable
        title="Discounts"
        columns={columns}
        tableAction={() => router.push("/master/discount/new")}
        data={data}
        searchKey="name"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/discount/${item.id}`)}
    />;
}