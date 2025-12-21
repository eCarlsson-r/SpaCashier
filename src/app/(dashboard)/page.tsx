"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Users, Ticket, CheckCircle, Activity } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
    let params = {};
    if (useAuth().user?.type === "STAFF") {
        params = { branch_id: useAuth().user?.employee?.branch_id };
    } else if (useAuth().user?.type === "THERAPIST") {
        params = { employee_id: useAuth().user?.employee?.id ?? "" };
    }
    const { data } = useQuery({
        queryKey: ["dashboard", params],
        queryFn: async () => {
            const { data } = await api.get(`/dashboard`, { params });
            return data;
        }
    });

    const stats = [
        { label: "Completed Sessions", value: data?.completed_count || 0, icon: CheckCircle, color: "text-emerald-600" },
        { label: "Ongoing Sessions", value: data?.ongoing_count || 0, icon: Activity, color: "text-amber-600" },
        { label: "Vouchers Sold", value: data?.vouchers_sold || 0, icon: Ticket, color: "text-blue-600" },
        { label: "Total Sales", value: `Rp ${data?.total_sales?.toLocaleString()}`, icon: Users, color: "text-teal-600" },
        { label: "Hot Treatment", value: data?.hot_treatment.name || "", icon: Ticket, color: "text-blue-600" },
        { label: "Hot Therapist", value: data?.hot_therapist.name || "", icon: Users, color: "text-blue-600" },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Today's Attendance & Performance */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Staff Attendance & Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={[
                                { accessorKey: "name", header: "Employee" },
                                { accessorKey: "clock_in", header: "Clock In" },
                                {
                                    accessorKey: "completed_sessions",
                                    header: "Sessions",
                                    cell: ({ row }) => <Badge variant="secondary">{row.original.completed_sessions}</Badge>
                                },
                                { accessorKey: "deduction", header: "Deduction" }
                            ]}
                            data={data?.today || []}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}