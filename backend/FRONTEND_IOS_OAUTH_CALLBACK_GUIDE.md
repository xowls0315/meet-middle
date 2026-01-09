# 프론트엔드 iOS OAuth 콜백 가이드

## 📋 개요

iOS Safari/WKWebView에서 쿠키 저장 문제를 해결하기 위해, OAuth 콜백을 프론트엔드에서 받아 처리하는 방식으로 변경되었습니다.

**변경 사항:**
- 기존: 백엔드에서 카카오 콜백 직접 처리 → 프론트엔드로 리다이렉트
- 변경: 프론트엔드에서 카카오 콜백 받기 → code 추출 → 백엔드에 전달

---

## 🔧 필수 설정 (카카오 개발자 콘솔)

### 1. Redirect URI 변경

**카카오 개발자 콘솔** → **내 애플리케이션** → **카카오 로그인** → **Redirect URI** 설정

```
https://meet-middle-frontend.vercel.app/auth/kakao/callback
http://localhost:3000/auth/kakao/callback (개발 환경)
```

⚠️ **중요**: 기존 백엔드 Redirect URI는 제거하거나 비활성화하세요.

---

## 📝 프론트엔드 구현

### 1. 라우트 생성: `/auth/kakao/callback`

Next.js App Router 기준 예시:

```typescript
// app/auth/kakao/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient'; // 또는 axios 인스턴스

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 code 추출
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // 에러 처리
        if (error) {
          console.error('카카오 로그인 에러:', error);
          setStatus('error');
          setTimeout(() => {
            router.push('/?login=error');
          }, 2000);
          return;
        }

        // code가 없으면 에러
        if (!code) {
          console.error('Authorization code not found');
          setStatus('error');
          setTimeout(() => {
            router.push('/?login=error');
          }, 2000);
          return;
        }

        // 백엔드에 code 전달하여 로그인 처리
        const response = await apiClient.post('/api/auth/kakao', { code });

        // Access Token 저장 (상태 관리 라이브러리 사용)
        const { accessToken, user } = response.data;
        
        // 예시: localStorage 또는 상태 관리
        localStorage.setItem('accessToken', accessToken);
        
        // 사용자 정보 저장 (선택사항)
        localStorage.setItem('user', JSON.stringify(user));

        setStatus('success');
        
        // 로그인 성공 후 메인 페이지로 이동
        router.push('/?login=success');
      } catch (error: any) {
        console.error('로그인 처리 실패:', error);
        setStatus('error');
        setTimeout(() => {
          router.push('/?login=error');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {status === 'loading' && (
        <>
          <div>로그인 처리 중...</div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            잠시만 기다려주세요.
          </div>
        </>
      )}
      {status === 'success' && (
        <>
          <div>✅ 로그인 성공!</div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            페이지로 이동 중...
          </div>
        </>
      )}
      {status === 'error' && (
        <>
          <div>❌ 로그인 실패</div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            다시 시도해주세요.
          </div>
        </>
      )}
    </div>
  );
}
```

### 2. 로그인 버튼 수정

기존 로그인 버튼은 그대로 유지하되, 백엔드 `/api/auth/kakao` GET 엔드포인트를 호출하면 됩니다:

```typescript
// components/LoginButton.tsx 또는 기존 로그인 컴포넌트
'use client';

export function LoginButton() {
  const handleKakaoLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    // 백엔드로 리다이렉트 (카카오 로그인 페이지로 이동)
    window.location.href = `${backendUrl}/api/auth/kakao`;
  };

  return (
    <button onClick={handleKakaoLogin}>
      카카오 로그인
    </button>
  );
}
```

### 3. API Client 설정 (Axios)

```typescript
// lib/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  withCredentials: true, // ⭐ 필수: 쿠키 전송 (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Access Token을 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 처리 및 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 응답 헤더에서 새 Access Token 확인
      const newAccessToken = error.response.headers['x-new-access-token'];

      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      // 응답 본문에서도 확인
      const responseData = error.response.data;
      if (responseData?.newAccessToken) {
        localStorage.setItem('accessToken', responseData.newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${responseData.newAccessToken}`;
        return apiClient(originalRequest);
      }

      // 새 토큰이 없으면 로그아웃 처리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔄 로그인 플로우

```
1. 사용자가 "카카오 로그인" 버튼 클릭
   ↓
2. 프론트엔드 → GET /api/auth/kakao 호출
   ↓
3. 백엔드 → 카카오 로그인 페이지로 리다이렉트
   ↓
4. 사용자가 카카오 로그인 완료
   ↓
5. 카카오 → 프론트엔드 /auth/kakao/callback?code=xxx 로 리다이렉트
   ↓
6. 프론트엔드 → code 추출 → POST /api/auth/kakao { code } 호출
   ↓
7. 백엔드 → code로 사용자 정보 받아오기 → 토큰 발급 → 쿠키 설정
   ↓
8. 프론트엔드 → Access Token 저장 → 메인 페이지로 이동
```

---

## 📱 iOS 호환성 개선 포인트

### 1. 프론트엔드 콜백 방식
- ✅ iOS Safari/WKWebView에서 쿠키 저장 문제 우회
- ✅ 프론트엔드에서 제어 가능
- ✅ 에러 처리 용이

### 2. 쿠키 설정
백엔드에서 이미 다음 설정으로 쿠키를 저장합니다:
```typescript
{
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
}
```

### 3. Access Token 저장
- Refresh Token: HttpOnly 쿠키에 저장 (백엔드에서 자동 설정)
- Access Token: 프론트엔드에서 localStorage 또는 메모리에 저장

---

## ✅ 체크리스트

프론트엔드에서 구현해야 할 사항:

- [ ] 카카오 개발자 콘솔에서 Redirect URI 변경: `https://meet-middle-frontend.vercel.app/auth/kakao/callback`
- [ ] `/auth/kakao/callback` 라우트/페이지 생성
- [ ] 콜백 페이지에서 `code` 추출 로직 구현
- [ ] `POST /api/auth/kakao` 호출하여 code 전달
- [ ] 응답에서 `accessToken` 저장 (localStorage 또는 상태 관리)
- [ ] 로그인 성공/실패 처리 및 리다이렉트
- [ ] API Client에 `withCredentials: true` 설정 확인
- [ ] Access Token을 Authorization 헤더에 추가하는 인터셉터 확인
- [ ] 401 에러 시 토큰 자동 갱신 로직 확인

---

## 🐛 문제 해결

### 문제 1: `code`가 없는 경우
- **원인**: 카카오 로그인이 취소되었거나 에러 발생
- **해결**: `error` 파라미터 확인 및 사용자에게 안내

### 문제 2: `401 Unauthorized` 에러
- **원인**: 카카오 code가 만료되었거나 잘못된 code
- **해결**: 다시 로그인 시도

### 문제 3: 쿠키가 저장되지 않음
- **원인**: `withCredentials: true` 설정 누락 또는 CORS 설정 문제
- **해결**: API Client 설정 및 백엔드 CORS 설정 확인

### 문제 4: iOS에서 여전히 로그인이 안 됨
- **원인**: 인앱 브라우저 문제 또는 쿠키 정책
- **해결**: 외부 브라우저로 열기 안내 (가이드 참고)

---

## 📊 환경변수 설정

프론트엔드 `.env.local` 파일:

```env
NEXT_PUBLIC_BACKEND_URL=https://meet-middle-backend.onrender.com
```

---

## 🎯 핵심 포인트

1. **카카오 Redirect URI 변경 필수**: 프론트엔드 도메인으로 설정
2. **콜백 페이지 생성**: `/auth/kakao/callback` 라우트 구현
3. **code 추출 및 전달**: URL에서 code를 추출하여 백엔드에 POST 요청
4. **Access Token 저장**: 응답에서 받은 Access Token을 저장
5. **에러 처리**: code가 없거나 에러 발생 시 적절한 처리

이 가이드를 참고하여 iOS에서도 정상적으로 카카오 로그인이 동작하도록 구현하세요! 🚀

