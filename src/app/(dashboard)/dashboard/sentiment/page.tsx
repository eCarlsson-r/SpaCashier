"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSelect } from "@/components/shared/AppSelect";
import { useAuth } from "@/hooks/useAuth";
import { useModel } from "@/hooks/useModel";
import { useSentimentRealtime } from "@/hooks/useSentimentRealtime";
import api from "@/lib/api";
import { SentimentDashboardData } from "@/lib/types";
import colors from "tailwindcss/colors";

type Period = "7" | "30" | "90";

const PERIOD_OPTIONS = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

export default function SentimentDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [branchId, setBranchId] = useState("");
  const [treatmentId, setTreatmentId] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [period, setPeriod] = useState<Period>("30");

  // Role guard — redirect non-managers
  useEffect(() => {
    if (!loading && user && user.type !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const filterParams = {
    branch_id: branchId || undefined,
    treatment_id: treatmentId || undefined,
    therapist_id: therapistId || undefined,
    period,
  };

  // Real-time updates via WebSocket; falls back to 30-second polling when disconnected
  const { refetchInterval } = useSentimentRealtime(branchId || null);

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useQuery<SentimentDashboardData>({
      queryKey: ["sentiment-dashboard", filterParams],
      queryFn: async () => {
        const { data } = await api.get("/ai/sentiment/dashboard", {
          params: filterParams,
        });
        return data;
      },
      enabled: !loading && user?.type === "ADMIN",
      staleTime: 0,
      refetchInterval,
    });

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery<{
    summary: string;
  }>({
    queryKey: ["sentiment-summary", filterParams],
    queryFn: async () => {
      const { data } = await api.get("/ai/sentiment/summary", {
        params: filterParams,
      });
      return data;
    },
    enabled: !loading && user?.type === "ADMIN",
    staleTime: 0,
    refetchInterval,
  });

  const branchOptions = useModel("branch", { mode: "select" }).options;
  const treatmentOptions = useModel("treatment", { mode: "select" }).options;
  const therapistOptions = useModel("employee", {
    mode: "select",
    params: { type: "THERAPIST" },
  }).options;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user || user.type !== "ADMIN") {
    return null;
  }

  const dist = dashboardData?.labelDistribution;
  const total = dist
    ? (dist.positive + dist.neutral + dist.negative) || 1
    : 1;

  const scoreColor = (score: number) => {
    if (score >= 0.3) return "text-emerald-600";
    if (score <= -0.3) return "text-rose-600";
    return "text-amber-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sentiment Dashboard</h1>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AppSelect
              value={branchId}
              options={[{ label: "All Branches", value: "" }, ...branchOptions]}
              onValueChange={setBranchId}
              placeholder="All Branches"
            />
            <AppSelect
              value={treatmentId}
              options={[
                { label: "All Treatments", value: "" },
                ...treatmentOptions,
              ]}
              onValueChange={setTreatmentId}
              placeholder="All Treatments"
            />
            <AppSelect
              value={therapistId}
              options={[
                { label: "All Therapists", value: "" },
                ...therapistOptions,
              ]}
              onValueChange={setTherapistId}
              placeholder="All Therapists"
            />
            <AppSelect
              value={period}
              options={PERIOD_OPTIONS}
              onValueChange={(v) => setPeriod(v as Period)}
              placeholder="Time Period"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Average Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div
                className={`text-3xl font-bold ${scoreColor(dashboardData?.averageScore ?? 0)}`}
              >
                {dashboardData?.averageScore?.toFixed(2) ?? "—"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Positive */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Positive
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold text-emerald-600">
                  {dist?.positive ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dist
                    ? ((dist.positive / total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Neutral */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Neutral
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold text-amber-600">
                  {dist?.neutral ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dist
                    ? ((dist.neutral / total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Negative */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Negative
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold text-rose-600">
                  {dist?.negative ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dist
                    ? ((dist.negative / total) * 100).toFixed(1)
                    : "0"}
                  % of total
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time-Series Chart + AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {isDashboardLoading ? (
              <div className="h-full w-full bg-muted animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.timeSeries ?? []}>
                  <defs>
                    <linearGradient
                      id="sentimentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colors.sky[500]}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors.sky[500]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[-1, 1]}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v.toFixed(1)}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      (value) ? value.toFixed(3) : 0,
                      "Avg Score",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="averageScore"
                    stroke={colors.sky[500]}
                    strokeWidth={2}
                    fill="url(#sentimentGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card>
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-muted animate-pulse rounded"
                    style={{ width: `${85 - i * 10}%` }}
                  />
                ))}
              </div>
            ) : summaryData?.summary ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summaryData.summary}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No summary available for the selected filters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Negative Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Negative Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {isDashboardLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : dashboardData?.recentNegative?.length ? (
            <div className="space-y-3">
              {dashboardData.recentNegative.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-rose-50/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {item.customerFirstName}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.treatmentName}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.comment}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-semibold shrink-0 ${scoreColor(item.sentimentScore)}`}
                  >
                    {item.sentimentScore.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No negative feedback found for the selected filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
