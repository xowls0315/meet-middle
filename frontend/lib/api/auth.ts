import apiClient from "./apiClient";
import { User } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://meet-middle-backend.onrender.com";

/**
 * 카카오 로그인 시작 (리다이렉트)
 */
export function startKakaoLogin(): void {
  window.location.href = `${BACKEND_URL}/api/auth/kakao`;
}

/**
 * Access Token 발급 (Refresh Token 쿠키 사용)
 * @returns Access Token
 */
export async function getAccessTokenFromServer(): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/auth/token`, {
    method: "GET",
    credentials: "include", // Refresh Token 쿠키 전송 필수
  });

  if (!response.ok) {
    throw new Error("Access Token 발급 실패");
  }

  const data = await response.json();
  return data.accessToken;
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
