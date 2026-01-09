# 프론트엔드 iOS OAuth 콜백 수정 요약

## 🔧 필수 수정 사항 (3가지)

### 1. 카카오 개발자 콘솔 설정
```
Redirect URI 변경:
https://meet-middle-frontend.vercel.app/auth/kakao/callback
http://localhost:3000/auth/kakao/callback (개발 환경)
```

### 2. 콜백 페이지 생성: `/auth/kakao/callback`

```typescript
// app/auth/kakao/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      router.push('/?login=error');
      return;
    }

    // 백엔드에 code 전달
    apiClient.post('/api/auth/kakao', { code })
      .then((response) => {
        // Access Token 저장
        localStorage.setItem('accessToken', response.data.accessToken);
        router.push('/?login=success');
      })
      .catch(() => {
        router.push('/?login=error');
      });
  }, [searchParams, router]);

  return <div>로그인 처리 중...</div>;
}
```

### 3. API Client 설정 확인

```typescript
// lib/apiClient.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // ⭐ 필수
});

// Access Token을 헤더에 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## ✅ 체크리스트

- [ ] 카카오 개발자 콘솔 Redirect URI 변경
- [ ] `/auth/kakao/callback` 페이지 생성
- [ ] code 추출 → `POST /api/auth/kakao` 호출
- [ ] Access Token 저장 (localStorage)
- [ ] API Client에 `withCredentials: true` 설정

---

## 🔄 로그인 플로우 (간단 버전)

1. 사용자 클릭 → `GET /api/auth/kakao` (백엔드로 리다이렉트)
2. 카카오 로그인 완료 → 프론트엔드 `/auth/kakao/callback?code=xxx`로 리다이렉트
3. 프론트엔드 → `POST /api/auth/kakao { code }` 호출
4. 백엔드 → 토큰 발급 (Refresh Token은 쿠키에 자동 저장)
5. 프론트엔드 → Access Token 저장 → 메인 페이지 이동

---

## 📝 핵심 변경점

**기존**: 백엔드에서 카카오 콜백 처리 → 프론트엔드로 리다이렉트  
**변경**: 프론트엔드에서 카카오 콜백 받기 → code를 백엔드에 전달

이렇게 변경하면 iOS Safari/WKWebView에서도 정상 동작합니다! 🚀

