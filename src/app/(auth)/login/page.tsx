"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { toast } from "sonner"; // For nice notifications
import Cookies from 'js-cookie';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const credentials = Object.fromEntries(formData);

        try {
            const { data } = await api.post("/login", credentials);
            Cookies.set('auth_token', data.token, { expires: 7, secure: true });
            toast.success("Login successful!");
            router.push("/dashboard"); // Default landing page
        } catch (err) {
            toast.error("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Card className="w-[400px]">
                <CardHeader className="text-center">
                    <CardTitle><img className="mx-auto" src="/images/logo.png" alt="Logo" /></CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input name="username" required placeholder="admin" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
                            {loading ? "Authenticating..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}