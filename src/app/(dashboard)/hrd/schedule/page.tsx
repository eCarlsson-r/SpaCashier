"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useEffect, useState } from "react";
import { DatePicker as WeekPicker } from "antd";
import { DatePicker } from "@/components/shared/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { AppSelect } from "@/components/shared/AppSelect";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import { CellContext, Row } from "@tanstack/react-table";

interface Schedule {
  name: string;
  job_type: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export default function SchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [activeModal, setActiveModal] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState({
    last_sync: null,
    is_online: false,
  });

  const employees = useModel("employee", { mode: "select" }).options;
  const shifts = useModel("shift", { mode: "select" }).options;

  dayjs.extend(relativeTime);
  dayjs.extend(isoWeek);

  const formatShift = ({ cell }: CellContext<Schedule, string>) => {
    if (cell.getValue() === "M") return "Morning";
    else if (cell.getValue() === "A") return "Afternoon";
    else if (cell.getValue() === "D") return "Whole Day";
    else if (cell.getValue() === "L") return "On Leave";
    else if (cell.getValue() === "N") return "New Normal";
  };

  const columns = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "job_type",
      header: "Job Type",
      cell: ({ row }: { row: Row<Schedule> }) =>
        row.original.job_type === "cashier" ? "Cashier" : "Therapist",
    },
    { accessorKey: "monday", header: "Monday", cell: formatShift },
    { accessorKey: "tuesday", header: "Tuesday", cell: formatShift },
    { accessorKey: "wednesday", header: "Wednesday", cell: formatShift },
    { accessorKey: "thursday", header: "Thursday", cell: formatShift },
    { accessorKey: "friday", header: "Friday", cell: formatShift },
    { accessorKey: "saturday", header: "Saturday", cell: formatShift },
    { accessorKey: "sunday", header: "Sunday", cell: formatShift },
  ];

  const fetchStatus = async () => {
    const res = await api.get("/attendance/sync-status");
    setSyncInfo(res.data);
  };

  useEffect(() => {
    fetchStatus();
    // Optional: Refresh status every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post("/attendance/sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const { data: scheduleData } = useModel<"attendance", Schedule>(
    `attendance/${selectedWeek}`,
    {
      mode: "table",
    },
  );

  const form = useForm({
    defaultValues: {
      employee_id: "",
      start_date: "",
      end_date: "",
      shift_id: "",
    },
  });

  const handleAddNew = () => {
    form.reset();
    setActiveModal("schedule");
  };

  const onSubmit = async (data: {
    employee_id: string;
    start_date: string;
    end_date: string;
    shift_id: string;
  }) => {
    await api.post(`/attendance/${selectedWeek}`, data);
    setActiveModal("");
    form.reset();
  };

  return (
    <div>
      <DataTable
        title="Schedule"
        columns={columns}
        data={scheduleData}
        customFilter={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Week</span>
              <div className="w-[200px]">
                <WeekPicker
                  value={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      // Using dayjs format to get Year-WNumber (e.g., 2025-W52)
                      const weekStr = dayjs(date)
                        .add(1, "weeks")
                        .format("YYYY-[W]WW");
                      setSelectedWeek(weekStr);
                    }
                  }}
                  picker="week"
                />
              </div>
            </div>

            {/* The New Sync Button */}
            <Button
              variant="outline"
              size="sm"
              className="border-sky-600 text-sky-600 hover:bg-sky-50 h-8"
              onClick={handleSync}
              disabled={isSyncing || !selectedWeek}
            >
              {isSyncing ? "Syncing..." : "Sync Device"}
            </Button>

            {/* The Last Sync Time */}
            {/* Visual cue: Green if synced recently, Amber if old */}
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                syncInfo.is_online ? "bg-green-500" : "bg-amber-500",
              )}
            />
            <span className="text-[10px] text-slate-400">
              {syncInfo.last_sync
                ? `Synced ${dayjs(syncInfo.last_sync).fromNow()}`
                : "Never Synced"}
            </span>
          </div>
        }
        tableAction={() => handleAddNew()}
      />

      <Dialog
        open={activeModal === "schedule"}
        onOpenChange={() => setActiveModal("")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeModal === "schedule"
                ? "Add New Schedule"
                : "Edit Schedule"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <AppSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={employees}
                        placeholder="Select Employee"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        form={form}
                        name={field.name}
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        form={form}
                        name={field.name}
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift ID</FormLabel>
                    <FormControl>
                      <AppSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={shifts}
                        placeholder="Select Shift"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700"
              >
                Add Schedule
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
