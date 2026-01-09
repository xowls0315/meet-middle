"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { User } from "@/types";
import * as authApi from "@/lib/api/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isLoadingRef = useRef(false); // 중복 요청 방지

  // Access Token 복원 (새로고침 시)
  const restoreAccessToken = useCallback(async () => {
    const existingToken = authApi.getAccessToken();
    if (existingToken) {
      // 토큰이 이미 있으면 사용
      return existingToken;
    }

    // Refresh Token 쿠키가 없으면 바로 null 반환 (게스트 모드)
    if (!authApi.hasRefreshTokenCookie()) {
      return null;
    }

    try {
      // Access Token이 없으면 Refresh Token으로 발급받기
      const newToken = await authApi.getAccessTokenFromServer();
      authApi.setAccessToken(newToken);
      return newToken;
    } catch {
      // Refresh Token도 없음 또는 만료됨 → 로그아웃 상태
      // 401 에러는 게스트 모드이므로 조용히 처리
      authApi.setAccessToken(null);
      return null;
    }
  }, []);

  // 사용자 정보 로드
  const loadUser = useCallback(async () => {
    // 이미 로딩 중이면 중복 요청 방지
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;

    try {
      setIsLoading(true);
      // 먼저 Access Token 복원 시도
      const token = await restoreAccessToken();

      // 토큰이 없으면 게스트 모드이므로 사용자 정보 조회하지 않음
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      // Authorization 헤더와 함께 사용자 정보 조회
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      // 429 또는 401 에러는 조용히 처리 (콘솔 에러 출력하지 않음)
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
      isLoadingRef.current = false;
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
  // iOS OAuth 콜백: 콜백 페이지(/auth/kakao/callback)에서 이미 토큰을 받아서 저장했으므로
  // 여기서는 단순히 사용자 정보만 다시 로드하면 됩니다.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const loginStatus = urlParams.get("login");

      if (loginStatus === "success") {
        const handleLoginSuccess = async () => {
          try {
            setIsLoading(true);

            // 개발 환경: URL 파라미터에서 Access Token 추출 (선택적, 하위 호환)
            const urlToken = urlParams.get("access_token");

            if (urlToken) {
              // 개발 환경: URL 파라미터에 Access Token이 있는 경우
              authApi.setAccessToken(urlToken);
            }
            // iOS OAuth 콜백: 콜백 페이지에서 이미 토큰을 localStorage에 저장했으므로
            // 별도로 토큰을 받을 필요 없이 사용자 정보만 로드

            // 사용자 정보 다시 로드
            await loadUser();

            // URL 정리 (보안)
            window.history.replaceState({}, document.title, window.location.pathname);
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
