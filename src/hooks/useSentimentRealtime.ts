// src/hooks/useSentimentRealtime.ts
// Requirements: 11.7
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { echo } from "@/lib/echo";

const POLL_INTERVAL_MS = 30_000;

/**
 * Subscribes to `private-branch.{branchId}` via Laravel Echo for `FeedbackAnalyzed` events.
 * On event receipt, invalidates React Query caches for `sentiment-dashboard` and `sentiment-summary`
 * to trigger a re-fetch.
 *
 * Falls back to a 30-second React Query refetch interval when the WebSocket is disconnected.
 * Returns `{ refetchInterval }` so the caller can pass it to `useQuery`.
 *
 * Requirements: 11.7
 */
export function useSentimentRealtime(branchId: string | number | null | undefined) {
    const queryClient = useQueryClient();
    const [wsConnected, setWsConnected] = useState(false);
    const channelRef = useRef<ReturnType<NonNullable<typeof echo>["private"]> | null>(null);

    useEffect(() => {
        if (!branchId || !echo) return;

        const channelName = `private-branch.${branchId}`;
        const channel = echo.private(channelName);
        channelRef.current = channel;

        // Track connection state via Pusher socket events
        const pusher = (
            echo as unknown as {
                connector: {
                    pusher: {
                        connection: {
                            bind: (event: string, cb: () => void) => void;
                            unbind: (event: string, cb: () => void) => void;
                        };
                    };
                };
            }
        ).connector?.pusher?.connection;

        const onConnected = () => setWsConnected(true);
        const onDisconnected = () => setWsConnected(false);

        if (pusher) {
            pusher.bind("connected", onConnected);
            pusher.bind("disconnected", onDisconnected);
            pusher.bind("unavailable", onDisconnected);
            pusher.bind("failed", onDisconnected);
        }

        // On FeedbackAnalyzed, invalidate both dashboard and summary caches
        channel.listen(".FeedbackAnalyzed", () => {
            queryClient.invalidateQueries({ queryKey: ["sentiment-dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["sentiment-summary"] });
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

    // When WebSocket is disconnected, fall back to 30-second polling
    const refetchInterval: number | false = wsConnected ? false : POLL_INTERVAL_MS;

    return { refetchInterval };
}
