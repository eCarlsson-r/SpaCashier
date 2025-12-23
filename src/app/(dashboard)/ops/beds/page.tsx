"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { useModel } from "@/hooks/useModel";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RoomSchema, BedSchema } from "@/lib/schemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Play, Plus, X, FlagTriangleRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type RoomData = z.infer<typeof RoomSchema>;
type BedData = z.infer<typeof BedSchema>;

const roomColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "occupied", header: "Occupied" },
    { accessorKey: "empty", header: "Empty" },
];

const SessionTimer = ({ startTime, durationMinutes, status, endTime }: any) => {
    const [now, setNow] = useState(new Date());

    const metrics = useMemo(() => {
        const timeToDate = (timeString: string | null | undefined) => {
            if (!timeString) return null;
            const [hours, minutes, seconds] = timeString.split(":").map(Number);
            const d = new Date();
            d.setHours(hours, minutes, seconds || 0, 0);
            return d;
        };

        const start = timeToDate(startTime);
        if (!start) return { elapsed: "-", remaining: "-", isOvertime: false };

        const expectedEnd = new Date(start.getTime() + (durationMinutes || 0) * 60000);

        const currentRef = (status === "completed" && endTime)
            ? timeToDate(endTime as string)
            : now;

        if (!currentRef) return { elapsed: "-", remaining: "-", isOvertime: false };

        const msecElapsed = currentRef.getTime() - start.getTime();
        const msecLeft = expectedEnd.getTime() - currentRef.getTime();

        const format = (msec: number) => {
            const abs = Math.abs(msec);
            const hh = Math.floor(abs / 3600000);
            const mm = Math.floor((abs % 3600000) / 60000);
            const ss = Math.floor((abs % 60000) / 1000);

            let res = "";
            if (hh > 0) res += `${hh}j `;
            if (mm > 0 || hh > 0) res += `${mm}m `;
            res += `${ss}d`;
            return res;
        };

        return {
            elapsed: format(msecElapsed),
            remaining: format(msecLeft),
            isOvertime: msecLeft < 0,
        };
    }, [startTime, durationMinutes, status, endTime, now]);

    return (
        <div className="flex flex-col gap-0.5 text-[11px] font-medium uppercase tracking-wider">
            <span>{status}</span>
            <span className="text-blue-600">{metrics.elapsed}</span>
            <span className={cn(
                metrics.isOvertime ? "text-destructive animate-pulse" : "text-red-600"
            )}>
                {metrics.isOvertime ? "-" : ""}{metrics.remaining}
            </span>
        </div>
    );
};

export default function BedsPage() {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const selectedRoomId = selectedRoom?.id;

    // Fetch details for the specific room when one is selected
    const { data: roomDetail, isLoading } = useQuery({
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
            // This triggers both the Room list and the Bed detail to refresh
            queryClient.invalidateQueries({ queryKey: ['room'] });
            toast.success("Session is now ongoing");
        }
    });

    // Finish Session Mutation
    const finishSession = useMutation({
        mutationFn: (id: string) => api.post(`/session/${id}/finish`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['room'] });
            toast.success("Session completed and bed is now free");
        }
    });

    // Remove Session Mutation
    const removeSession = useMutation({
        mutationFn: (id: string) => api.delete(`/session/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['room'] });
            toast.info("Session deleted");
        }
    });

    const handleAdd = (bed: BedData) => {
        router.push(`/ops/session/new?bed_id=${bed.id}&room_id=${selectedRoomId}`);
    };

    const bedColumns = [
        {
            accessorKey: "session.status",
            header: "Actions",
            cell: ({ row: { original } }: { row: { original: BedData } }) => {
                if (original.session === null || original.session === undefined) {
                    return (
                        <Button variant="ghost" size="sm" onClick={() => handleAdd(original)}>
                            <Plus className="h-4 w-4 text-blue-500" />
                        </Button>
                    );
                } else if (original.session.status === "waiting") {
                    return (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startSession.mutate(original.session.id)}>
                                <Play className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeSession.mutate(original.session.id)}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    );
                } else if (original.session.status === "ongoing") {
                    return (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => finishSession.mutate(original.session.id)}>
                                <FlagTriangleRight className="h-4 w-4 text-purple-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeSession.mutate(original.session.id)}>
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
                        highlightId={selectedRoom?.id}
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