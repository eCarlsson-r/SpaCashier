"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";

const roomColumns = [
    { accessorKey: "branch.name", header: "Branch Name" },
    { accessorKey: "name", header: "Room Name" },
    { accessorKey: "description", header: "Room Description" }
];

export default function RoomPage() {
    const router = useRouter();
    return (
        <DataTable
            title="Rooms"
            columns={roomColumns}
            tableAction={() => router.push("/master/room/new")}
            data={useModel("room", { mode: "table" }).data}
            searchKey="name"
            actions={(item) => (
                <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={() => console.log(item)}>
                        Delete
                    </Button>
                </div>
            )}
            onRowClick={(item) => router.push(`/master/room/${item.id}`)}
        />
    );
}