"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { clearUserQueries } from "@/hooks/queries/clearUserQueries";

export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const storeLogout = useAuthStore((s) => s.logout);
  const loadUser = useAuthStore((s) => s.loadUser);

  const reloadUser = useCallback(() => loadUser(true), [loadUser]);

  const logout = useCallback(async () => {
    await storeLogout();
    clearUserQueries(queryClient);
  }, [storeLogout, queryClient]);

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    reloadUser,
  };
}
