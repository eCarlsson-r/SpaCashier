"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PWAContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const { user } = useAuth();

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function subscribe() {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      setSubscription(sub);

      const key = sub.getKey("p256dh");
      const auth = sub.getKey("auth");

      if (!key || !auth) {
        throw new Error("Failed to get subscription keys");
      }

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)));
      const authToken = btoa(String.fromCharCode(...new Uint8Array(auth)));

      await api.post("/subscribe", {
        user_id: user.id,
        endpoint: sub.endpoint,
        public_key: p256dh,
        auth_token: authToken,
        content_encoding: "aes128gcm",
      });

      toast.success("Push notifications enabled");
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
      toast.error("Failed to enable push notifications");
    }
  }

  return (
    <PWAContext.Provider
      value={{ isSupported, isSubscribed: !!subscription, subscribe }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) throw new Error("usePWA must be used within PWAProvider");
  return context;
};
