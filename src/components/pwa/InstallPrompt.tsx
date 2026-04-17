"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const SNOOZE_KEY = "pwa-install-snoozed";
const SNOOZE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const t = useTranslations("pwa");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    const snoozed = localStorage.getItem(SNOOZE_KEY);
    const isSnoozed = snoozed !== null && Date.now() - Number(snoozed) < SNOOZE_DURATION;

    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(prompt);
      if (!isSnoozed) {
        setCanShow(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!canShow || !deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    setCanShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now()));
    setCanShow(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-blue-600 px-4 py-3 text-white shadow-md">
      <span className="text-sm font-medium">{t("installPrompt")}</span>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="rounded bg-white px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50"
        >
          {t("installAccept")}
        </button>
        <button
          onClick={handleDismiss}
          className="rounded border border-white px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t("installDismiss")}
        </button>
      </div>
    </div>
  );
}
