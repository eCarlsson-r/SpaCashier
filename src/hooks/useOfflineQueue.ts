"use client";

import { useState, useEffect } from "react";
import { offlineQueue } from "@/lib/offlineQueue";
import type { QueuedOperation } from "@/lib/types";

export interface UseOfflineQueueReturn {
  pendingCount: number;
  enqueue: (op: Omit<QueuedOperation, "id" | "enqueuedAt" | "retryCount" | "status">) => Promise<string>;
  flush: () => Promise<void>;
}

export function useOfflineQueue(): UseOfflineQueueReturn {
  const [pendingCount, setPendingCount] = useState(0);

  // Poll the queue count every 2 seconds
  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const count = await offlineQueue.count();
        if (active) setPendingCount(count);
      } catch {
        // IndexedDB may be unavailable; ignore
      }
    };

    poll();
    const interval = setInterval(poll, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  async function enqueue(
    op: Omit<QueuedOperation, "id" | "enqueuedAt" | "retryCount" | "status">,
  ): Promise<string> {
    return offlineQueue.enqueue(op);
  }

  async function flush(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.serviceWorker) {
      return;
    }

    const controller = navigator.serviceWorker.controller;
    if (!controller) {
      return;
    }

    controller.postMessage({ type: "FLUSH_QUEUE" });
  }

  return { pendingCount, enqueue, flush };
}
