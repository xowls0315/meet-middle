import apiClient from "./apiClient";
import { User } from "@/types";
import { isInAppBrowser, openInExternalBrowser } from "@/utils/browser";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://meet-middle-backend.onrender.com";

/**
 * 카카오 로그인 시작 (리다이렉트)
 * 인앱 브라우저에서는 외부 브라우저로 열기 안내
 */
export function startKakaoLogin(): void {
  const loginUrl = `${BACKEND_URL}/api/auth/kakao`;

  if (isInAppBrowser()) {
    // 인앱 브라우저 감지 → 외부 브라우저로 열기 안내
    const shouldOpen = confirm(
      "카카오 로그인을 위해 외부 브라우저에서 열어주세요.\n\n" + "외부 브라우저로 열까요?"
    );

    if (shouldOpen) {
      openInExternalBrowser(loginUrl);
    }
  } else {
    // 일반 브라우저 → 바로 로그인
    window.location.href = loginUrl;
  }
}

/**
 * Refresh Token 쿠키 존재 여부 확인
 * @returns Refresh Token 쿠키가 있으면 true
 */
export function hasRefreshTokenCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((cookie) => cookie.trim().startsWith("refresh_token="));
}

/**
 * Access Token 발급 (Refresh Token 쿠키 사용)
 * @param skipCookieCheck 쿠키 확인을 건너뛸지 여부 (로그인 콜백 시 사용)
 * @param retryCount 재시도 횟수 (모바일에서 쿠키 반영 대기)
 * @returns Access Token
 */
export async function getAccessTokenFromServer(skipCookieCheck: boolean = false, retryCount: number = 0): Promise<string> {
  // Refresh Token 쿠키가 없으면 에러 발생 (게스트 모드)
  // 단, 로그인 콜백 시에는 쿠키가 아직 반영되지 않을 수 있으므로 확인 건너뛰기 가능
  if (!skipCookieCheck && !hasRefreshTokenCookie()) {
    throw new Error("Refresh Token 쿠키가 없습니다");
  }

  try {
    // apiClient를 사용하여 쿠키 자동 전송 (withCredentials: true)
    const response = await apiClient.get<{ accessToken: string }>("/auth/token");
    return response.data.accessToken;
  } catch (error: any) {
    // 모바일에서 쿠키가 아직 반영되지 않은 경우 재시도
    // 최대 3회, 각각 500ms, 1000ms, 1500ms 대기
    if (skipCookieCheck && retryCount < 3 && (error.response?.status === 401 || error.response?.status === 403)) {
      await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 500));
      return getAccessTokenFromServer(skipCookieCheck, retryCount + 1);
    }
    
    throw new Error(error.response?.data?.error || error.message || "Access Token 발급 실패");
  }
}

/**
 * 현재 사용자 정보 조회
 * @returns 사용자 정보
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

/**
 * Access Token 갱신
 * @returns 새 Access Token
 */
export async function refreshToken(): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include", // Refresh Token 쿠키 전송 필수
  });

  if (!response.ok) {
    throw new Error("Access Token 갱신 실패");
  }

  const data = await response.json();
  return data.accessToken;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    // 리다이렉트로 인한 에러는 무시
    console.log("로그아웃 완료");
  } finally {
    // 로컬 스토리지에서 토큰 제거
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  }
}

/**
 * Access Token 저장 (localStorage 및 전역 상태)
 */
let accessTokenState: string | null = null;

export function setAccessToken(token: string | null): void {
  accessTokenState = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
}

/**
 * Access Token 가져오기 (localStorage 우선, 없으면 state)
 */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    // localStorage에서 먼저 확인
    const token = localStorage.getItem("accessToken");
    if (token) {
      accessTokenState = token;
      return token;
    }
  }
  return accessTokenState;
}
