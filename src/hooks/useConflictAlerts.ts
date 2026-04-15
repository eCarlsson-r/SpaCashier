// src/hooks/useConflictAlerts.ts
// Requirements: 6.4, 6.5
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { echo } from "@/lib/echo";
import api from "@/lib/api";
import { ConflictRecord } from "@/lib/types";

const POLL_INTERVAL_MS = 30_000;

async function fetchConflicts(branchId: string | number): Promise<ConflictRecord[]> {
    const { data } = await api.get("/conflicts", { params: { branch_id: branchId } });
    return data;
}

/**
 * Subscribes to `private-branch.{branchId}` via Laravel Echo for `ConflictDetected` events.
 * Falls back to React Query polling every 30 seconds when the WebSocket is disconnected.
 *
 * Returns `{ conflicts, isLoading }`.
 *
 * Requirements: 6.4, 6.5
 */
export function useConflictAlerts(branchId: string | number | null | undefined) {
    const queryClient = useQueryClient();
    const [wsConnected, setWsConnected] = useState(false);
    const channelRef = useRef<ReturnType<NonNullable<typeof echo>["private"]> | null>(null);

    // React Query — used for polling fallback and as the source-of-truth cache
    const { data, isLoading } = useQuery<ConflictRecord[]>({
        queryKey: ["conflicts", branchId],
        queryFn: () => fetchConflicts(branchId!),
        enabled: !!branchId,
        // Poll only when WebSocket is disconnected
        refetchInterval: wsConnected ? false : POLL_INTERVAL_MS,
        staleTime: POLL_INTERVAL_MS,
        retry: false,
    });

    useEffect(() => {
        if (!branchId || !echo) return;

        const channelName = `private-branch.${branchId}`;

        const channel = echo.private(channelName);
        channelRef.current = channel;

        // Track connection state via Pusher socket events
        const pusher = (echo as unknown as { connector: { pusher: { connection: { bind: (event: string, cb: () => void) => void; unbind: (event: string, cb: () => void) => void } } } }).connector?.pusher?.connection;

        const onConnected = () => setWsConnected(true);
        const onDisconnected = () => setWsConnected(false);

        if (pusher) {
            pusher.bind("connected", onConnected);
            pusher.bind("disconnected", onDisconnected);
            pusher.bind("unavailable", onDisconnected);
            pusher.bind("failed", onDisconnected);
        }

        // Listen for ConflictDetected events and append to the cache
        channel.listen(".ConflictDetected", (event: ConflictRecord) => {
            queryClient.setQueryData<ConflictRecord[]>(
                ["conflicts", branchId],
                (prev) => {
                    const existing = prev ?? [];
                    // Avoid duplicates
                    if (existing.some((c) => c.id === event.id)) return existing;
                    return [event, ...existing];
                }
            );
        });

        return () => {
            if (pusher) {
                pusher.unbind("connected", onConnected);
                pusher.unbind("disconnected", onDisconnected);
                pusher.unbind("unavailable", onDisconnected);
                pusher.unbind("failed", onDisconnected);
            }
            echo?.leaveChannel(channelName);
            channelRef.current = null;
        };
    }, [branchId, queryClient]);

    return {
        conflicts: data ?? [],
        isLoading,
    };
}
