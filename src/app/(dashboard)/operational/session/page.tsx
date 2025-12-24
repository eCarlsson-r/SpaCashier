"use client";

import { AppSelect } from "@/components/shared/AppSelect";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useModel } from "@/hooks/useModel";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FlagTriangleRight, Play, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SessionTimer } from "@/components/shared/SessionTimer";

type SessionData = {
    id: string;
    start: string;
    end: string;
    status: string;
    treatment_duration: number;
}

export default function SessionPage() {
    const router = useRouter();
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
            // 1. Refresh the Beds list (so the bed turns 'ongoing')
            queryClient.invalidateQueries({ queryKey: ['bed'] });

            // 2. Refresh the Sessions list
            queryClient.invalidateQueries({ queryKey: ['session', JSON.stringify(selectedStatus)], exact: false });
            toast.success("Session is now ongoing");
        }
    });

    // Finish Session Mutation
    const finishSession = useMutation({
        mutationFn: (id: string) => api.post(`/session/${id}/finish`),
        onSuccess: () => {
            // 1. Refresh the Beds list (so the bed turns 'ongoing')
            queryClient.invalidateQueries({ queryKey: ['bed'] });

            // 2. Refresh the Sessions list
            queryClient.invalidateQueries({ queryKey: ['session', JSON.stringify(selectedStatus)], exact: false });
            toast.success("Session completed and bed is now free");
        }
    });

    // Remove Session Mutation
    const removeSession = useMutation({
        mutationFn: (id: string) => api.delete(`/session/${id}`),
        onSuccess: () => {
            // 1. Refresh the Beds list (so the bed turns 'ongoing')
            queryClient.invalidateQueries({ queryKey: ['bed'] });

            // 2. Refresh the Sessions list
            queryClient.invalidateQueries({ queryKey: ['session', JSON.stringify(selectedStatus)], exact: false });
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
                            durationMinutes={row.original.treatment_duration}
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
                            <Button type="button" variant="ghost" size="sm" onClick={() => startSession.mutate(original.id)}>
                                <Play className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSession.mutate(original.id)}>
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    );
                } else if (original.status === "ongoing") {
                    return (
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => finishSession.mutate(original.id)}>
                                <FlagTriangleRight className="h-4 w-4 text-purple-500" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSession.mutate(original.id)}>
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
                            { value: "canceled", label: "Cancelled" }
                        ]}
                        value={JSON.stringify(selectedStatus)}
                        onValueChange={(val) => setSelectedStatus(JSON.parse(val))}
                    />
                </div>
            </div>
        }
        tableAction={() => router.push("/operational/session/new")}
    />;
}