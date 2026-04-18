"use client";

import { usePWA } from "./PWAManager";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function UpdatePrompt() {
  const { showUpdatePrompt, applyUpdate } = usePWA();
  const t = useTranslations("pwa");

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg bg-sky-600 p-4 text-white shadow-lg md:left-auto md:w-96">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">{t("updateAvailable")}</p>
        <p className="text-xs opacity-90">{t("refreshToUpdate")}</p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={applyUpdate}
        className="shrink-0"
      >
        {t("installAccept")}
      </Button>
    </div>
  );
}
