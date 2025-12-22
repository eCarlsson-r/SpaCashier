"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const columns = [
    { header: "Intro Key", accessorKey: "intro_key" },
    { header: "Title Key", accessorKey: "title_key" },
    { header: "Subtitle Key", accessorKey: "subtitle_key" },
    { header: "Description Key", accessorKey: "description_key" },
    { header: "Action Key", accessorKey: "action_key" },
    { header: "Action Page", accessorKey: "action_page" },
    { header: "Image", accessorKey: "image" },
];

export default function BannerPage() {
    const router = useRouter();
    return <DataTable
        title="Banners"
        columns={columns}
        tableAction={() => router.push("/master/banner/new")}
        data={useModel("banner", { mode: "table" }).data}
        searchKey="title_key"
        actions={(item) => (
            <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                    Delete
                </Button>
            </div>
        )}
        onRowClick={(item) => router.push(`/master/banner/${item.id}`)}
    />;
}