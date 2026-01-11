"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Users, Ticket, CheckCircle, Activity, Spotlight, HandCoins, BanknoteX, ReceiptText } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AppSelect } from "@/components/shared/AppSelect";
import { useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import colors from 'tailwindcss/colors';
import { useModel } from "@/hooks/useModel";

export default function Dashboard() {
    const [profitYear, setProfitYear] = useState("2022");
    const [jobDate, setJobDate] = useState(new Date());
    const [payrollPeriod, setPayrollPeriod] = useState("");
    const [payrollSummary, setPayrollSummary] = useState([]);
    const profitYears = [
        { value: "2019", label: "2019" },
        { value: "2020", label: "2020" },
        { value: "2021", label: "2021" },
        { value: "2022", label: "2022" },
    ];
    
    const { user } = useAuth();
    const params: { profit_year: string, job_date: string, [key: string]: number | string } = {profit_year: profitYear, job_date: jobDate.toISOString().split('T')[0]};
    if (user?.type === "STAFF") {
        params.branch_id = user?.employee?.branch_id;
    } else if (user?.type === "THERAPIST") {
        params.employee_id = user?.employee?.id;
    }

    const { data } = useQuery({
        queryKey: ["dashboard", params],
        queryFn: async () => {
            const { data } = await api.get(`/dashboard`, { params });
            return data;
        }
    });
    // Helper to format currency
    const formatCurr = (val: number) => new Intl.NumberFormat('id-ID').format(val);
    const periods = useModel("period", {"mode":"select", params: {employee_id: user?.employee?.id}}).options

    const getPayrollData = async (period: string) => {
        setPayrollPeriod(period);
        const { data } = await api.get('/compensation', {
            params: {
                "period_id": period,
                "employee_id": user?.employee?.id
            }
        });

        setPayrollSummary(data);
    }

    const stats = (user?.type == "THERAPIST") ? [
        { label: "Completed Sessions", value: data?.completed_sessions || 0, icon: CheckCircle, color: "text-emerald-600" },
        { label: "Ongoing Sessions", value: data?.active_sessions || 0, icon: Activity, color: "text-amber-600" },
        { label: "Today Commision", value: `Rp. ${formatCurr(data?.today_commision) || 0},-`, icon: ReceiptText, color: "text-blue-600" },
        { label: "Hot Treatment", value: data?.hot_treatment || "", icon: Spotlight, color: "text-blue-600" },
        { label: "Current Commision", value: `Rp. ${formatCurr(data?.current_commision) || 0},-`, icon: HandCoins, color: "text-emerald-600" },
        { label: "Current Deduction", value: `Rp. ${formatCurr(data?.current_deduction) || 0},-`, icon: BanknoteX, color: "text-rose-600" }
    ] : [
        { label: "Completed Sessions", value: data?.completed_sessions || 0, icon: CheckCircle, color: "text-emerald-600" },
        { label: "Ongoing Sessions", value: data?.active_sessions || 0, icon: Activity, color: "text-amber-600" },
        { label: "Vouchers Sold", value: data?.vouchers_sold || 0, icon: Ticket, color: "text-blue-600" },
        { label: "Total Sales", value: `Rp. ${formatCurr(data?.today_sales) || 0},-`, icon: ReceiptText, color: "text-teal-600" },
        { label: "Hot Treatment", value: data?.hot_treatment || "", icon: Spotlight, color: "text-blue-600" },
        { label: "Hot Therapist", value: data?.hot_therapist || "", icon: Users, color: "text-blue-600" },
    ];
    
    let chartData: any[] = [];
    if (data?.monthly_income && data?.monthly_expense) {
        const hashmap: Record<string, any> = {};

        // Process the first array: add each object to the hashmap using its id as the key
        for (const item of data.monthly_income) {
            hashmap[item.month] = item;
        }

        // Process the second array: check if the id exists, then merge or add the new item
        for (const item of data.monthly_expense) {
            if (hashmap[item.month]) {
                // If the id exists, merge the properties, giving precedence to arr2 properties
                hashmap[item.month] = { ...hashmap[item.month], ...item };
            } else {
                // If the id doesn't exist, add it as a new entry
                hashmap[item.month] = item;
            }
        }
        // Convert the hashmap values back to an array and sort by id
        chartData = Object.values(hashmap).sort((a, b) => a.month - b.month);
    } else if (data?.monthly_income) {
        const hashmap: Record<string, any> = {};

        // Process the first array: add each object to the hashmap using its id as the key
        for (const item of data.monthly_income) {
            hashmap[item.month] = item;
        }

        // Convert the hashmap values back to an array and sort by id
        chartData = Object.values(hashmap).sort((a, b) => a.month - b.month);
    } else if (data?.monthly_commision && data?.monthly_attendance) {
        const hashmap: Record<string, any> = {};

        // Process the first array: add each object to the hashmap using its id as the key
        for (const item of data.monthly_commision) {
            hashmap[item.month] = item;
        }

        // Process the second array: check if the id exists, then merge or add the new item
        for (const item of data.monthly_attendance) {
            if (hashmap[item.month]) {
                // If the id exists, merge the properties, giving precedence to arr2 properties
                hashmap[item.month] = { ...hashmap[item.month], ...item };
            } else {
                // If the id doesn't exist, add it as a new entry
                hashmap[item.month] = item;
            }
        }
        // Convert the hashmap values back to an array and sort by id
        chartData = Object.values(hashmap).sort((a, b) => a.month - b.month);
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <div className="grid grid-cols-2">
                            <CardTitle>Monthly Revenue Trend</CardTitle>
                            <AppSelect 
                                value={profitYear}
                                options={profitYears}
                                onValueChange={(e) => setProfitYear(e)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" minWidth="0" minHeight="0" height="100%">
                            <BarChart barGap={0} data={chartData}>
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value/1000}k`} />
                                <Tooltip />
                                {data?.monthly_income && <Bar dataKey="income" fill={colors.emerald[600]} radius={[4, 4, 0, 0]} />}
                                {data?.monthly_expense && <Bar dataKey="expense" fill={colors.rose[600]} radius={[4, 4, 0, 0]} />}
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                {/* Today's Attendance & Performance */}
                {user?.type == "THERAPIST" ? (
                    <Card>
                        <CardHeader>
                            <div className="grid grid-cols-2">
                                <CardTitle>Payroll Slip</CardTitle>
                                <AppSelect 
                                    value={payrollPeriod}
                                    options={periods}
                                    onValueChange={(e) => {getPayrollData(e)}}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={[
                                { accessorKey: 'attribute', header : 'Payroll Attribute' },
                                { accessorKey: 'value', header : 'Payroll Value', cell: (info) => (typeof info.getValue() == "string") ? info.getValue() : `Rp. ${formatCurr(info.getValue() as number)}` }
                            ]} data={payrollSummary} />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                    <CardHeader>
                        <div className="grid grid-cols-2">
                            <CardTitle>Staff Attendance & Performance</CardTitle>
                            <DatePicker 
                                value={jobDate}
                                onChange={(e) => setJobDate(new Date(e || ""))}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={[
                                { accessorKey: "name", header: "Employee" },
                                { accessorKey: "clock_in", header: "Clock In" },
                                {
                                    accessorKey: "sessions",
                                    header: "Sessions",
                                    cell: ({ row }) => <div className="flex gap-3">
                                        <Badge variant="default">{row.original.active_sessions || 0}</Badge>
                                        <Badge variant="secondary">{row.original.completed_sessions || 0}</Badge>
                                        {parseInt(row.original.active_sessions || 0) + parseInt(row.original.completed_sessions || 0)}
                                    </div>
                                },
                                { accessorKey: "deduction", header: "Deduction" }
                            ]}
                            data={data?.today || []}
                        />
                    </CardContent>
                </Card>
                )}
            </div>
        </>
    );
}