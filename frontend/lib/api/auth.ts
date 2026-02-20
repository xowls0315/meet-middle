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
 * Access Token 발급 (Refresh Token 쿠키 사용)
 * - Refresh Token은 HttpOnly 쿠키라 JS로 존재 여부를 확인할 수 없음
 * - 따라서 항상 서버에 요청해보고(쿠키는 자동 전송), 실패(401/403)면 게스트로 판단
 * @param retryCount 재시도 횟수 (모바일에서 쿠키 반영 대기)
 * @returns Access Token
 */
export async function getAccessTokenFromServer(retryCount: number = 0): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/token`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = (await response.json()) as { accessToken: string };
      return data.accessToken;
    }

    // 모바일에서 쿠키가 아직 반영되지 않은 경우 재시도 (최대 3회)
    if (retryCount < 3 && (response.status === 401 || response.status === 403)) {
      await new Promise((resolve) => setTimeout(resolve, (retryCount + 1) * 500));
      return getAccessTokenFromServer(retryCount + 1);
    }

    let errMsg = "Access Token 발급 실패";
    try {
      const errBody = (await response.json()) as { error?: string; message?: string };
      errMsg = errBody.error || errBody.message || errMsg;
    } catch {
      // ignore
    }

    throw new Error(errMsg);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Access Token 발급 실패");
    }
    throw new Error("Access Token 발급 실패");
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
  } catch {
    // 리다이렉트로 인한 에러는 무시
    console.log("로그아웃 완료");
  } finally {
    // 메모리 토큰 제거
    setAccessToken(null);
  }
}

/**
 * Access Token 저장 (메모리 전용)
 */
let accessTokenState: string | null = null;

export function setAccessToken(token: string | null): void {
  accessTokenState = token;
}

/**
 * Access Token 가져오기 (메모리 전용)
 */
export function getAccessToken(): string | null {
  return accessTokenState;
}

/**
 * 로컬 회원가입 / 로그인 / ID/PW 찾기 API
 */
export async function registerWithCredentials(params: {
  username: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; user: User }> {
  const response = await apiClient.post<{ accessToken: string; user: User }>(
    "/auth/local/register",
    params
  );
  const { accessToken, user } = response.data;
  if (accessToken) {
    setAccessToken(accessToken);
  }
  return { accessToken, user };
}

export async function loginWithCredentials(params: {
  identifier: string;
  password: string;
}): Promise<{ accessToken: string; user: User }> {
  const response = await apiClient.post<{ accessToken: string; user: User }>(
    "/auth/local/login",
    params
  );
  const { accessToken, user } = response.data;
  if (accessToken) {
    setAccessToken(accessToken);
  }
  return { accessToken, user };
}

export async function findIdByEmail(email: string): Promise<string | null> {
  const response = await apiClient.post<{ username: string | null }>("/auth/local/find-id", {
    email,
  });
  return response.data.username ?? null;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post("/auth/local/find-password", { email });
}
