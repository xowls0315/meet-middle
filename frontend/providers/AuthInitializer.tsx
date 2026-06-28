"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import * as authApi from "@/lib/api/auth";

export default function AuthInitializer() {
  const searchParams = useSearchParams();
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const loginStatus = searchParams?.get("login");

    if (loginStatus !== "success") return;

    const handleLoginSuccess = async () => {
      try {
        const urlToken = searchParams.get("access_token");
        if (urlToken) {
          authApi.setAccessToken(urlToken);
        }

        await loadUser(true);

        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error("로그인 후 사용자 정보 로드 실패:", error);
        authApi.setAccessToken(null);
        useAuthStore.setState({ user: null, isLoggedIn: false, isLoading: false });
      }
    };

    handleLoginSuccess();
  }, [loadUser, searchParams]);

  return null;
}
