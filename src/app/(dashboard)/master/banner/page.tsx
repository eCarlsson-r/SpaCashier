"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMaster } from "@/hooks/useMaster";

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
    return <DataTable title="Banners" columns={columns} data={useMaster("banner", false).data || []} searchKey="title_key" />;
}