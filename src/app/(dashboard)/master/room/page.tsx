"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { useMaster } from "@/hooks/useMaster";

const roomColumns = [
    { accessorKey: "name", header: "Name" }
];

const bedColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "room_id", header: "Room" },
];

export default function CashflowPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardContent>
                    <DataTable title="Rooms" columns={roomColumns} data={useMaster("room", false).data || []} searchKey="name" />
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <DataTable title="Beds" columns={bedColumns} data={useMaster("bed", false).data || []} searchKey="name" />
                </CardContent>
            </Card>
        </div>
    );
}