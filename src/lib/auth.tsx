import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api, tokenStore, ApiUser, Role } from "./api";

export type AppRole = "guest" | Role;

interface AuthCtx {
  user: ApiUser | null;
  role: AppRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<ApiUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tokenStore.get());

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      return;
    }
    try {
      setUser(await api.auth.me());
    } catch {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.auth.register(data);
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      /* сессии может уже не быть — выходим локально */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const role: AppRole = user ? user.role : "guest";

  return <Ctx.Provider value={{ user, role, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
