import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

export function SessionTimer({ startTime, durationMinutes, status, endTime }: any) {
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