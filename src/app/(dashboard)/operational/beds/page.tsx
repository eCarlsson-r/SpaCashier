"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { useModel } from "@/hooks/useModel";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RoomSchema, BedSchema } from "@/lib/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Play, Plus, X, FlagTriangleRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SessionTimer } from "@/components/shared/SessionTimer";

type RoomData = z.infer<typeof RoomSchema>;
type BedData = z.infer<typeof BedSchema>;

const roomColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "occupied", header: "Occupied" },
    { accessorKey: "empty", header: "Empty" },
];

export default function BedsPage() {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
    const selectedRoomId = selectedRoom?.id;

    // Fetch details for the specific room when one is selected
    const { data: roomDetail } = useQuery({
        queryKey: ['room', selectedRoomId],
        queryFn: async () => {
            const res = await api.get(`/room/${selectedRoomId}?show=session`);
            return res.data;
        },
        enabled: !!selectedRoomId, // Prevents fetching when no room is selected
    });

    const queryClient = useQueryClient();

    // Start Session Mutation
    const startSession = useMutation({
        mutationFn: (id: string) => api.post(`/session/${id}/start`),
        onSuccess: () => {
            // 1. Refresh the Beds list (so the bed turns 'ongoing')
            queryClient.invalidateQueries({ queryKey: ['room', selectedRoomId], exact: false });
            // 2. Refresh the Sessions list
            queryClient.invalidateQueries({ queryKey: ['session'], exact: false });
            toast.success("Session is now ongoing");
        }
    });

    // Finish Session Mutation
    const finishSession = useMutation({
        mutationFn: (id: string) => api.post(`/session/${id}/finish`),
        onSuccess: () => {
            // 1. Refresh the Beds list (so the bed turns 'ongoing')
            queryClient.invalidateQueries({ queryKey: ['room', selectedRoomId], exact: false });
            // 2. Refresh the Sessions list
            queryClient.invalidateQueries({ queryKey: ['session'], exact: false });
            toast.success("Session completed and bed is now free");
        }
    });

    // Remove Session Mutation
    const removeSession = useMutation({
        mutationFn: (id: string) => api.delete(`/session/${id}`),
        onSuccess: () => {
            // 1. Refresh the Beds list (so the bed turns 'ongoing')
            queryClient.invalidateQueries({ queryKey: ['bed'], exact: false });

            // 2. Refresh the Sessions list
            queryClient.invalidateQueries({ queryKey: ['session'], exact: false });
            toast.info("Session deleted");
        }
    });

    const handleAdd = (bed: BedData) => {
        router.push(`/operational/session/new?bed_id=${bed.id}&room_id=${selectedRoomId}`);
    };

    const bedColumns = [
        {
            accessorKey: "session.status",
            header: "Actions",
            cell: ({ row: { original } }: { row: { original: BedData } }) => {
                if (original.session === null || original.session === undefined) {
                    return (
                        <Button className="hover:bg-sky-200" variant="ghost" size="sm" onClick={() => handleAdd(original)}>
                            <Plus className="h-4 w-4 text-blue-500" />
                        </Button>
                    );
                } else if (original.session.status === "waiting") {
                    return (
                        <div className="flex items-center gap-2">
                            <Button className="hover:bg-sky-200" variant="ghost" size="sm" onClick={() => startSession.mutate(original.session.id)}>
                                <Play className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button className="hover:bg-sky-200" variant="ghost" size="sm" onClick={() => removeSession.mutate(original.session.id)}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    );
                } else if (original.session.status === "ongoing") {
                    return (
                        <div className="flex items-center gap-2">
                            <Button className="hover:bg-sky-200" variant="ghost" size="sm" onClick={() => finishSession.mutate(original.session.id)}>
                                <FlagTriangleRight className="h-4 w-4 text-purple-500" />
                            </Button>
                            <Button className="hover:bg-sky-200" variant="ghost" size="sm" onClick={() => removeSession.mutate(original.session.id)}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    );
                }
            }
        },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "session.employee.name", header: "Therapist" },
        {
            accessorKey: "session.start",
            header: "Duration",
            cell: ({ row: { original } }: { row: { original: BedData } }) => {
                if (original.session === null || typeof original.session === "undefined") return;

                if (original.session.status === "ongoing" || original.session.status === "completed") {
                    return (
                        <SessionTimer
                            startTime={original.session.start}
                            durationMinutes={original.session.treatment.duration}
                            status={original.session.status}
                            endTime={original.session.end}
                        />
                    );
                } else {
                    return '';
                }
            }
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardContent>
                    <DataTable
                        title="Rooms"
                        columns={roomColumns}
                        data={useModel("room", { mode: "table" }).data}
                        searchKey="name"
                        onRowClick={(row) => {
                            // Use type assertion to tell TS this row definitely has an id
                            const room = row as RoomData;
                            setSelectedRoom(room);
                        }}
                        highlightId={selectedRoom?.id?.toString()}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <DataTable
                        title={`Beds for ${selectedRoom?.name || "..."}`}
                        data={roomDetail?.bed || []}
                        columns={bedColumns}
                    />
                </CardContent>
            </Card>
        </div>
    );
}