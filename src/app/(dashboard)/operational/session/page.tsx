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
import { useAuth } from "@/hooks/useAuth";
import { SessionSchema } from "@/lib/schemas";
import z from "zod";
import { useTranslations } from "next-intl";

export default function SessionPage() {
  const t = useTranslations("session");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const tTable = useTranslations("table");
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(["waiting", "ongoing"]);
  const { user } = useAuth();

  let params;
  if (user?.type == "THERAPIST") {
    params = {
      status: JSON.stringify(selectedStatus),
      employee_id: user?.employee?.id,
    };
  } else if (user?.type == "STAFF") {
    params = {
      status: JSON.stringify(selectedStatus),
      branch_id: user?.branch?.id,
    };
  } else {
    params = {
      status: JSON.stringify(selectedStatus),
    };
  }

  const { data: sessionData } = useModel("session", {
    params: params,
    mode: "table",
  });

  const queryClient = useQueryClient();

  // Start Session Mutation
  const startSession = useMutation({
    mutationFn: (id: string) => api.post(`/session/${id}/start`),
    onSuccess: () => {
      // 1. Refresh the Beds list (so the bed turns 'ongoing')
      queryClient.invalidateQueries({ queryKey: ["bed"] });

      // 2. Refresh the Sessions list
      queryClient.invalidateQueries({
        queryKey: ["session", JSON.stringify(selectedStatus)],
        exact: false,
      });
      toast.success(t("startSuccess"));
    },
  });

  // Finish Session Mutation
  const finishSession = useMutation({
    mutationFn: (id: string) => api.post(`/session/${id}/finish`),
    onSuccess: () => {
      // 1. Refresh the Beds list (so the bed turns 'ongoing')
      queryClient.invalidateQueries({ queryKey: ["bed"] });

      // 2. Refresh the Sessions list
      queryClient.invalidateQueries({
        queryKey: ["session", JSON.stringify(selectedStatus)],
        exact: false,
      });
      toast.success(t("finishSuccess"));
    },
  });

  // Remove Session Mutation
  const removeSession = useMutation({
    mutationFn: (id: string) => api.delete(`/session/${id}`),
    onSuccess: () => {
      // 1. Refresh the Beds list (so the bed turns 'ongoing')
      queryClient.invalidateQueries({ queryKey: ["bed"] });

      // 2. Refresh the Sessions list
      queryClient.invalidateQueries({
        queryKey: ["session", JSON.stringify(selectedStatus)],
        exact: false,
      });
      toast.info(t("deleteSuccess"));
    },
  });

  const columns = [
    { accessorKey: "order_time", header: tTable("order") },
    { accessorKey: "customer_name", header: tTable("customer") },
    { accessorKey: "treatment_name", header: tTable("treatment") },
    { accessorKey: "therapist_name", header: tTable("therapist") },
    { accessorKey: "bed_name", header: tTable("bed") },
    {
      accessorKey: "session.start",
      header: tTable("duration"),
      cell: ({ row }: { row: { original: z.infer<typeof SessionSchema> } }) => {
        if (
          row.original.status === "ongoing" ||
          row.original.status === "completed"
        ) {
          return (
            <SessionTimer
              startTime={row.original.start}
              durationMinutes={row.original.treatment?.duration}
              status={row.original.status}
              endTime={row.original.end}
            />
          );
        } else {
          return "";
        }
      },
    },
    { accessorKey: "status", header: tTable("status") },
    { accessorKey: "payment", header: tTable("payment") },
    {
      accessorKey: "session.status",
      header: tCommon("actions"),
      cell: ({ row }: { row: { original: z.infer<typeof SessionSchema> } }) => {
        if (row.original.status === "waiting") {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="hover:bg-sky-200"
                variant="ghost"
                size="sm"
                onClick={() =>
                  startSession.mutate(row.original.id?.toString() || "")
                }
              >
                <Play className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                type="button"
                className="hover:bg-sky-200"
                variant="ghost"
                size="sm"
                onClick={() =>
                  removeSession.mutate(row.original.id?.toString() || "")
                }
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        } else if (row.original.status === "ongoing") {
          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="hover:bg-sky-200"
                variant="ghost"
                size="sm"
                onClick={() =>
                  finishSession.mutate(row.original.id?.toString() || "")
                }
              >
                <FlagTriangleRight className="h-4 w-4 text-purple-500" />
              </Button>
              <Button
                type="button"
                className="hover:bg-sky-200"
                variant="ghost"
                size="sm"
                onClick={() =>
                  removeSession.mutate(row.original.id?.toString() || "")
                }
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        }
      },
    },
  ];

  if (user?.type == "THERAPIST") {
    return (
      <DataTable
        title={t("title")}
        columns={columns}
        data={sessionData}
        customFilter={
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{tCommon("status")}</span>
            <div className="w-[200px]">
              <AppSelect
                multiple={true}
                options={[
                  { value: "ongoing", label: tStatus("ongoing") },
                  { value: "completed", label: tStatus("completed") },
                  { value: "waiting", label: tStatus("waiting") },
                  { value: "canceled", label: tStatus("canceled") },
                ]}
                value={JSON.stringify(selectedStatus)}
                onValueChange={(val) => setSelectedStatus(JSON.parse(val))}
              />
            </div>
          </div>
        }
      />
    );
  } else {
    return (
      <DataTable
        title={t("title")}
        columns={columns}
        data={sessionData}
        customFilter={
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{tCommon("status")}</span>
            <div className="w-[200px]">
              <AppSelect
                multiple={true}
                options={[
                  { value: "ongoing", label: tStatus("ongoing") },
                  { value: "completed", label: tStatus("completed") },
                  { value: "waiting", label: tStatus("waiting") },
                  { value: "canceled", label: tStatus("canceled") },
                ]}
                value={JSON.stringify(selectedStatus)}
                onValueChange={(val) => setSelectedStatus(JSON.parse(val))}
              />
            </div>
          </div>
        }
        tableAction={() => router.push("/operational/session/new")}
      />
    );
  }
}
