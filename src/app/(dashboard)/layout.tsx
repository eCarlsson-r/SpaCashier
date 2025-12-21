import { Navbar } from "@/components/layout/Navbar";
import { UserNav } from "@/components/layout/UserNav";
import { AuthProvider } from "@/hooks/useAuth"; // Your auth context provider
import { BranchProvider } from "@/providers/branch-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <BranchProvider>
                <div className="flex min-h-screen flex-col items-center bg-slate-50/40">
                    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
                        <div className="container flex h-16 items-center justify-between">
                            <div className="flex items-center mx-auto gap-10">
                                <img className="mx-auto" src="/images/logo.png" alt="Logo" />
                                <Navbar />
                            </div>
                            <UserNav />
                        </div>
                    </header>
                    <main className="container flex-1 py-8">
                        {children}
                    </main>
                </div>
            </BranchProvider>
        </AuthProvider>
    );
}