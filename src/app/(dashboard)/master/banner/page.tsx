"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const columns = [
    { header: "Introduction", accessorKey: "introduction" },
    { header: "Title", accessorKey: "title" },
    { header: "Subtitle", accessorKey: "subtitle" },
    { header: "Description", accessorKey: "description" },
    { header: "Action", accessorKey: "action" },
    { header: "Action Page", accessorKey: "action_page" },
    { header: "Image", accessorKey: "image" },
];

export default function BannerPage() {
    const router = useRouter();
    const { data, remove } = useModel('banner');

    return <DataTable
        title="Banners"
        columns={columns}
        tableAction={() => router.push("/master/banner/new")}
        data={data}
        searchKey="title"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => remove(item.id?.toString() || '')}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/banner/${item.id}`)}
    />;
}