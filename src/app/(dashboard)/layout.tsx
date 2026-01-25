import { Navbar } from "@/components/layout/Navbar";
import { UserNav } from "@/components/layout/UserNav";
import { AuthProvider } from "@/hooks/useAuth";
import { BranchProvider } from "@/providers/branch-provider";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <BranchProvider>
        <div className="flex min-h-screen flex-col items-center bg-sky-50/40">
          <header className="sticky top-0 z-50 w-full border-b bg-sky-600 shadow-sm">
            <div className="container flex h-16 mx-auto items-center justify-between">
              <div className="flex items-center gap-10">
                <Link href="/dashboard">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={100}
                    height={100}
                  />
                </Link>
                <Navbar />
              </div>
              <UserNav />
            </div>
          </header>
          <main className="container flex-1 py-8">{children}</main>
        </div>
      </BranchProvider>
    </AuthProvider>
  );
}
