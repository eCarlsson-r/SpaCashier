"use client";
import { Navbar } from "@/components/layout/Navbar";
import { UserNav } from "@/components/layout/UserNav";
import { AuthProvider } from "@/hooks/useAuth";
import { BranchProvider } from "@/providers/branch-provider";
import Image from "next/image";
import Link from "next/link";

import { PWAProvider, usePWA } from "@/components/pwa/PWAManager";
import { StaffChatPanel } from "@/components/ai/StaffChatPanel";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { SyncNotification } from "@/components/pwa/SyncNotification";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOnline, pendingCount } = usePWA();
  return (
    <div className="flex min-h-screen flex-col items-center bg-sky-50/40">
      <OfflineIndicator isOnline={isOnline} pendingCount={pendingCount} />
      <SyncNotification />
      <UpdatePrompt />
      <header className="sticky top-0 z-50 w-full border-b bg-sky-600 shadow-sm px-4 md:px-0">
        <div className="container flex h-16 mx-auto items-center justify-between">
          <div className="flex items-center gap-4 md:gap-10 flex-row-reverse md:flex-row">
            <Link href="/dashboard">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={200}
                height={200}
                className="w-40 h-auto object-contain"
                priority
              />
            </Link>
            <Navbar />
          </div>
          <UserNav />
        </div>
      </header>
      <main className="container flex-1 py-8 px-4 md:px-0">{children}</main>
      <StaffChatPanel />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <BranchProvider>
        <PWAProvider>
          <DashboardContent>{children}</DashboardContent>
        </PWAProvider>
      </BranchProvider>
    </AuthProvider>
  );
}
