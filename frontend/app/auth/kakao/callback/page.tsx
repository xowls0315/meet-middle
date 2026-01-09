"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/api/apiClient";
import * as authApi from "@/lib/api/auth";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 code 파라미터 추출
        const code = searchParams.get("code");

        if (!code) {
          // code가 없으면 에러 처리
          setError("로그인에 실패했습니다. code 파라미터가 없습니다.");
          setTimeout(() => {
            router.push("/?login=error");
          }, 2000);
          return;
        }

        // 백엔드에 code 전달하여 토큰 발급받기
        // POST /api/auth/kakao { code }
        const response = await apiClient.post<{ accessToken: string }>("/auth/kakao", {
          code,
        });

        // Access Token 저장
        if (response.data.accessToken) {
          authApi.setAccessToken(response.data.accessToken);

          // 로그인 성공 시 메인 페이지로 이동
          router.push("/?login=success");
        } else {
          throw new Error("Access Token을 받지 못했습니다.");
        }
      } catch (error: any) {
        console.error("카카오 로그인 콜백 처리 오류:", error);
        setError(error.response?.data?.error || error.message || "로그인에 실패했습니다.");

        // 에러 페이지로 이동
        setTimeout(() => {
          router.push("/?login=error");
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-2">로그인 실패</p>
            <p className="text-gray-600 text-sm">{error}</p>
            <p className="text-gray-500 text-xs mt-4">잠시 후 메인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center animate-spin">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">로그인 처리 중...</p>
            <p className="text-gray-500 text-sm">잠시만 기다려주세요.</p>
          </>
        )}
      </div>
    </div>
  );
}
