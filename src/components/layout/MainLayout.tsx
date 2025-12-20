import { Navbar } from "./Navbar"; // We'll assume the Navbar logic we discussed
import { UserNav } from "./UserNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Top Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-bold text-primary">SpaPro 2025</span>
                        <Navbar /> {/* This contains your grouped horizontal menus */}
                    </div>
                    <UserNav />
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container py-6">
                {children}
            </main>
        </div>
    );
}