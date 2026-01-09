import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import * as authApi from "./auth";

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://meet-middle-backend.onrender.com";

// axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000, // 30초
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Refresh Token 쿠키 전송 필수
});

// 요청 인터셉터: Authorization 헤더 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined" && config.headers) {
      // 공개 엔드포인트는 Authorization 헤더 불필요
      const publicEndpoints = ["/search/suggest", "/recommend", "/share"];
      const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

      if (!isPublicEndpoint) {
        // Access Token을 Authorization 헤더에 추가
        const token = authApi.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 공개 엔드포인트는 401 에러를 그대로 반환 (토큰 갱신 시도 안 함)
      const publicEndpoints = ["/search/suggest", "/recommend", "/share"];
      const isPublicEndpoint = publicEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint));

      if (isPublicEndpoint) {
        // 공개 엔드포인트의 401은 서버 문제이거나 권한 문제
        authApi.setAccessToken(null);
        return Promise.reject(error);
      }

      // 인증 관련 엔드포인트는 토큰 갱신 시도 안 함 (무한 루프 방지)
      const authEndpoints = ["/auth/me", "/auth/refresh", "/auth/token"];
      const isAuthEndpoint = authEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint));

      if (isAuthEndpoint) {
        // 인증 관련 엔드포인트의 401 에러는 게스트 모드이므로 조용히 처리
        // 콘솔 에러를 출력하지 않기 위해 빈 에러 객체 반환
        authApi.setAccessToken(null);
        const silentError = new Error();
        silentError.name = "SilentAuthError";
        return Promise.reject(silentError);
      }

      // 다른 엔드포인트의 경우: 백엔드가 401 응답에 새 토큰을 포함했는지 확인
      originalRequest._retry = true;

      // 1. 응답 헤더에서 새 Access Token 확인
      const newAccessTokenFromHeader = error.response.headers["x-new-access-token"] as string | undefined;

      // 2. 응답 본문에서 새 Access Token 확인 (헤더에 없을 경우)
      let newAccessTokenFromBody: string | undefined;
      if (!newAccessTokenFromHeader && error.response.data) {
        try {
          const responseData = error.response.data as { newAccessToken?: string };
          newAccessTokenFromBody = responseData?.newAccessToken;
        } catch {
          // 본문 파싱 실패 시 무시
        }
      }

      // 새 토큰이 있는 경우
      const newAccessToken = newAccessTokenFromHeader || newAccessTokenFromBody;
      if (newAccessToken) {
        // 새 Access Token을 저장
        authApi.setAccessToken(newAccessToken);

        // 원래 요청에 새 토큰을 추가하여 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      }

      // 새 토큰이 없으면 Refresh Token도 만료된 것 → 로그아웃 처리
      authApi.setAccessToken(null);
      // 로그인 페이지로 리다이렉트 (필요시)
      // if (typeof window !== "undefined") {
      //   window.location.href = "/";
      // }
      return Promise.reject(error);
    }

    // 429 Rate Limit 에러 처리
    if (error.response?.status === 429) {
      // 인증 관련 엔드포인트는 조용히 처리 (콘솔 에러 안 띄움)
      const authEndpoints = ["/auth/me", "/auth/refresh", "/auth/token"];
      const isAuthEndpoint = authEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint));

      if (isAuthEndpoint) {
        const silentError = new Error("Rate limit exceeded");
        silentError.name = "SilentRateLimitError";
        return Promise.reject(silentError);
      }

      const errorMessage = (error.response.data as { error?: string; message?: string })?.error || "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      return Promise.reject(new Error(errorMessage));
    }

    // 500 에러 처리
    if (error.response?.status === 500) {
      const errorMessage = (error.response.data as { error?: string; message?: string })?.error || "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      return Promise.reject(new Error(errorMessage));
    }

    // 기타 에러 처리
    const errorMessage = (error.response?.data as { error?: string; message?: string })?.error || error.message || "알 수 없는 오류가 발생했습니다.";
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
