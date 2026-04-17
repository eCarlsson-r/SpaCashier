"use client";

import { useTranslations } from "next-intl";

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
}

export function OfflineIndicator({ isOnline, pendingCount }: OfflineIndicatorProps) {
  const t = useTranslations("offline");

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-medium text-amber-900 shadow-md">
      {t("banner", { count: pendingCount })}
    </div>
  );
}
