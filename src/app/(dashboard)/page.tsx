import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Users, Ticket, CheckCircle, Activity } from "lucide-react";

export default function Dashboard({ data }) {
    const stats = [
        { label: "Completed Sessions", value: data.completed_count, icon: CheckCircle, color: "text-emerald-600" },
        { label: "Ongoing Sessions", value: data.ongoing_count, icon: Activity, color: "text-amber-600" },
        { label: "Vouchers Sold", value: data.vouchers_sold, icon: Ticket, color: "text-blue-600" },
        { label: "Total Sales", value: `Rp ${data.total_sales.toLocaleString()}`, icon: Users, color: "text-teal-600" },
        { label: "Hot Treatment", value: data.hot_treatment.name, icon: Ticket, color: "text-blue-600" },
        { label: "Hot Therapist", value: data.hot_therapist.name, icon: Users, color: "text-blue-600" },
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
                            ]}
                            data={data.employees}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}