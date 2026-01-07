"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import * as authApi from "@/lib/api/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Access Token 복원 (새로고침 시)
  const restoreAccessToken = useCallback(async () => {
    const existingToken = authApi.getAccessToken();
    if (existingToken) {
      // 토큰이 이미 있으면 사용
      return existingToken;
    }

    try {
      // Access Token이 없으면 Refresh Token으로 발급받기
      const newToken = await authApi.getAccessTokenFromServer();
      authApi.setAccessToken(newToken);
      return newToken;
    } catch (error) {
      // Refresh Token도 없음 → 로그아웃 상태
      authApi.setAccessToken(null);
      return null;
    }
  }, []);

  // 사용자 정보 로드
  const loadUser = useCallback(async () => {
    try {
      // 먼저 Access Token 복원 시도
      await restoreAccessToken();

      // Authorization 헤더와 함께 사용자 정보 조회
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      // 401 에러는 인증 실패 (Access Token 만료 또는 없음)
      setIsLoggedIn(false);
      setUser(null);
      authApi.setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [restoreAccessToken]);

  // 초기 로드 (새로고침 시)
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
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const loginStatus = urlParams.get("login");

      if (loginStatus === "success") {
        const handleLoginSuccess = async () => {
          try {
            // 개발 환경: URL 파라미터에서 Access Token 추출 (선택적)
            const urlToken = urlParams.get("access_token");

            if (urlToken) {
              // 개발 환경: URL 파라미터에 Access Token이 있는 경우
              authApi.setAccessToken(urlToken);
            } else {
              // 프로덕션 환경: /api/auth/token 호출하여 Access Token 받기
              const token = await authApi.getAccessTokenFromServer();
              authApi.setAccessToken(token);
            }

            // 사용자 정보 다시 로드
            await loadUser();

            // URL 정리 (보안)
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error("로그인 후 토큰 발급 실패:", error);
            setIsLoggedIn(false);
            setUser(null);
            authApi.setAccessToken(null);
          }
        };

        handleLoginSuccess();
      }
    }
  }, [loadUser]);

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    reloadUser: loadUser,
  };
}
