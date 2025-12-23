"use client";

import { AppSelect } from "@/components/shared/AppSelect";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModel } from "@/hooks/useModel";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { FlagTriangleRight, Loader2, Play, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SessionData = {
    id: string;
    start: string;
    end: string;
    status: string;
    treatment: {
        duration: number;
    };
}

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

export default function SessionPage() {
    const [selectedStatus, setSelectedStatus] = useState(["waiting", "ongoing"]);

    const { data: sessionData } = useModel("session", {
        status: JSON.stringify(selectedStatus),
        mode: "table"
    });

    const queryClient = useQueryClient();

    // Start Session Mutation
    const startSession = useMutation({
        mutationFn: (id: string) => api.post(`/session/${id}/start`),
        onSuccess: () => {
            // This triggers both the Room list and the Bed detail to refresh
            queryClient.invalidateQueries({ queryKey: ['session'] });
            toast.success("Session is now ongoing");
        }
    });

    // Finish Session Mutation
    const finishSession = useMutation({
        mutationFn: (id: string) => api.post(`/session/${id}/finish`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['session'] });
            toast.success("Session completed and bed is now free");
        }
    });

    // Remove Session Mutation
    const removeSession = useMutation({
        mutationFn: (id: string) => api.delete(`/session/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['session'] });
            toast.info("Session deleted");
        }
    });

    const columns = [
        { accessorKey: "order_time", header: "Order" },
        { accessorKey: "customer_name", header: "Customer" },
        { accessorKey: "treatment_name", header: "Treatment" },
        { accessorKey: "therapist_name", header: "Therapist" },
        { accessorKey: "bed_name", header: "Bed" },
        {
            accessorKey: "session.start",
            header: "Duration",
            cell: ({ row }: { row: { original: SessionData } }) => {
                if (row.original.status === "ongoing" || row.original.status === "completed") {
                    return (
                        <SessionTimer
                            startTime={row.original.start}
                            durationMinutes={row.original.treatment.duration}
                            status={row.original.status}
                            endTime={row.original.end}
                        />
                    );
                } else {
                    return '';
                }
            }
        },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "payment", header: "Payment" },
        {
            accessorKey: "session.status",
            header: "Actions",
            cell: ({ row: { original } }: { row: { original: SessionData } }) => {
                if (original.status === "waiting") {
                    return (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => startSession.mutate(original.id)}>
                                <Play className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeSession.mutate(original.id)}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    );
                } else if (original.status === "ongoing") {
                    return (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => finishSession.mutate(original.id)}>
                                <FlagTriangleRight className="h-4 w-4 text-purple-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeSession.mutate(original.id)}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    );
                }
            }
        }
    ];

    return <DataTable
        title="Session"
        columns={columns}
        data={sessionData}
        customFilter={
            <div className="flex items-center gap-2" >
                <span className="text-sm font-medium">Status</span>
                <div className="w-[200px]">
                    <AppSelect multiple={true}
                        options={[
                            { value: "ongoing", label: "Ongoing" },
                            { value: "completed", label: "Completed" },
                            { value: "waiting", label: "Waiting" },
                            { value: "canceled", label: "Canceled" }
                        ]}
                        value={JSON.stringify(selectedStatus)}
                        onValueChange={(val) => setSelectedStatus(JSON.parse(val))}
                    />
                </div>
            </div>
        }
    />;
}