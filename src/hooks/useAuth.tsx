"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Branch } from "@/lib/types";
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  type: string;
  employee: {
    id: number;
    name: string;
    branch_id: number;
    gender: string;
  };
  branch: {
    id: number;
    name: string;
  };
  branches: Branch[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/user"); // Matches Laravel's Auth::user()
      setUser(data);
    } catch (err) {
      console.info(err);
      setUser(null);
      Cookies.remove("auth_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string) => {
    Cookies.set('auth_token', token, { expires: 7, secure: true });
    await fetchUser();
    router.push("/dashboard");
  };

  const logout = () => {
    Cookies.remove("auth_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};