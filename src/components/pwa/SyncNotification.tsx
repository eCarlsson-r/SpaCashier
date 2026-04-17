"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface SyncSuccessMessage {
  type: "SYNC_SUCCESS";
  operationId: string;
}

interface SyncFailedMessage {
  type: "SYNC_FAILED";
  operationId: string;
  status: number;
  url: string;
}

type SyncMessage = SyncSuccessMessage | SyncFailedMessage;

export function SyncNotification() {
  const t = useTranslations("offline");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.serviceWorker) return;

    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      const { data } = event;
      if (!data || !data.type) return;

      if (data.type === "SYNC_SUCCESS") {
        toast.success(t("backOnline"));
      } else if (data.type === "SYNC_FAILED") {
        toast.error(t("syncFailed", { operation: data.url }));
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [t]);

  return null;
}
