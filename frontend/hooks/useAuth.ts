"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { User } from "@/types";
import * as authApi from "@/lib/api/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const loadUser = useCallback(async (force = false) => {
    try {
      setIsLoading(true);
      const { user: userData } = await authApi.loadSession(force);

      if (!userData) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      if (error instanceof Error && (error.name === "SilentRateLimitError" || error.name === "SilentAuthError")) {
        // 조용히 처리
      } else {
        console.error("사용자 정보 로드 오류:", error);
      }
      setIsLoggedIn(false);
      setUser(null);
      authApi.setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 (앱 전역 loadSession으로 중복 요청 방지)
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // 로그인
  const login = useCallback(() => {
    authApi.startKakaoLogin();
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("로그아웃 오류:", error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  // 카카오 로그인 콜백 처리 (리다이렉트 후)
  useEffect(() => {
    const loginStatus = searchParams?.get("login");

    if (loginStatus === "success") {
      const handleLoginSuccess = async () => {
        try {
          setIsLoading(true);
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
          setIsLoggedIn(false);
          setUser(null);
          authApi.setAccessToken(null);
        } finally {
          setIsLoading(false);
        }
      };

      handleLoginSuccess();
    }
  }, [loadUser, searchParams]);

  const reloadUser = useCallback(async () => {
    await loadUser(true);
  }, [loadUser]);

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    reloadUser,
  };
}
