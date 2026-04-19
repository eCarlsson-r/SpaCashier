"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecommendations } from "@/hooks/useRecommendations";
import { TreatmentRecommendation } from "@/lib/types";

interface RecommendationPanelProps {
  customerId: string | number | null | undefined;
  branchId: string | number | null | undefined;
}

function RecommendationItem({ rec }: { rec: TreatmentRecommendation }) {
  const formatCurr = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-sky-50 border border-sky-100">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-slate-800 truncate">
          {rec.treatment.name}
        </span>
        <Badge variant="secondary" className="shrink-0 text-xs">
          #{rec.rank}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>{rec.treatment.duration} min</span>
        <span className="font-medium text-sky-700">{formatCurr(rec.treatment.price)}</span>
      </div>
      <p className="text-xs text-slate-600 italic">{rec.rationale}</p>
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-sky-50 border border-sky-100">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

/**
 * Displays up to 3 AI-recommended treatments for the current customer.
 * Panel is hidden entirely when service is unavailable or returns an error.
 * Requirements: 2.1, 2.4, 2.5
 */
export function RecommendationPanel({ customerId, branchId }: RecommendationPanelProps) {
  const { data, isLoading, isError } = useRecommendations(customerId, branchId);

  // Hide panel silently on error or when no customer/branch context
  if (isError || (!isLoading && data.length === 0 && !customerId)) {
    return null;
  }

  return (
    <Card className="border-sky-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-sky-700">
          <Sparkles size={16} />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {isLoading ? (
          <>
            <RecommendationSkeleton />
            <RecommendationSkeleton />
            <RecommendationSkeleton />
          </>
        ) : (
          data.slice(0, 3).map((rec) => (
            <RecommendationItem key={rec.rank} rec={rec} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
