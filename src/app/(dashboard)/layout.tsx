import { Navbar } from "@/components/layout/Navbar";
import { UserNav } from "@/components/layout/UserNav";
import { AuthProvider } from "@/hooks/useAuth"; // Your auth context provider

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="flex min-h-screen flex-col bg-slate-50/40">
                <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
                    <div className="container flex h-16 items-center justify-between">
                        <div className="flex items-center gap-10">
                            <div className="font-bold text-teal-600 tracking-wider">SPA SYSTEM</div>
                            <Navbar />
                        </div>
                        <UserNav />
                    </div>
                </header>
                <main className="container flex-1 py-8">
                    {children}
                </main>
            </div>
        </AuthProvider>
    );
}