# 프론트엔드 토큰 자동 갱신 구현 가이드

## 📋 개요

백엔드에서 Access Token 만료 시 자동으로 새 토큰을 발급하므로, 프론트엔드에서는 **응답에서 새 토큰을 받아서 저장하고 원래 요청을 재시도**하는 로직을 추가해야 합니다.

---

## 🔧 구현 필요 사항

### 1. Axios Interceptor 설정

프론트엔드에서 Axios Interceptor를 사용하여 401 응답을 처리하고 새 토큰으로 재시도해야 합니다.

---

## 📝 구현 예시

### 방법 1: 응답 헤더에서 새 토큰 확인 (권장)

```typescript
// lib/apiClient.ts 또는 utils/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Access Token 저장 위치 (예: React Context, Zustand, localStorage 등)
let accessToken: string | null = null;

// Access Token 설정 함수 (프로젝트 구조에 맞게 수정)
export function setAccessToken(token: string | null) {
  accessToken = token;
  // React Context나 상태 관리 라이브러리 사용 시 여기서 업데이트
}

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  withCredentials: true, // 쿠키 전송 (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Access Token을 헤더에 추가
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 처리 및 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 응답 헤더에서 새 Access Token 확인
      const newAccessToken = error.response.headers['x-new-access-token'] as string;

      if (newAccessToken) {
        // 새 토큰 저장
        setAccessToken(newAccessToken);

        // 원래 요청에 새 토큰 추가하여 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      // 응답 본문에서도 확인 (헤더에 없을 경우)
      const responseData = error.response.data as { newAccessToken?: string };
      if (responseData?.newAccessToken) {
        setAccessToken(responseData.newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${responseData.newAccessToken}`;
        return apiClient(originalRequest);
      }

      // 새 토큰이 없으면 Refresh Token도 만료된 것 → 로그아웃 처리
      setAccessToken(null);
      // 로그아웃 로직 (예: 로그인 페이지로 리다이렉트)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 방법 2: React Context와 함께 사용

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Axios 인스턴스 생성
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    withCredentials: true,
  });

  // 요청 인터셉터
  apiClient.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // 헤더에서 새 토큰 확인
        const newAccessToken = error.response.headers['x-new-access-token'] as string;
        
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }

        // 본문에서 확인
        const responseData = error.response.data as { newAccessToken?: string };
        if (responseData?.newAccessToken) {
          setAccessToken(responseData.newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${responseData.newAccessToken}`;
          return apiClient(originalRequest);
        }

        // 로그아웃 처리
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }

      return Promise.reject(error);
    }
  );

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// apiClient를 export하여 다른 곳에서 사용
export { apiClient };
```

### 방법 3: Zustand와 함께 사용

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
}));

// apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = 
        (error.response.headers['x-new-access-token'] as string) ||
        (error.response.data as { newAccessToken?: string })?.newAccessToken;

      if (newAccessToken) {
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      // 로그아웃
      useAuthStore.getState().setAccessToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## ✅ 체크리스트

프론트엔드에서 구현해야 할 사항:

- [ ] Axios 인스턴스 생성 (baseURL, withCredentials 설정)
- [ ] 요청 인터셉터: Access Token을 Authorization 헤더에 추가
- [ ] 응답 인터셉터: 401 에러 처리
- [ ] 응답 헤더(`X-New-Access-Token`) 또는 본문(`newAccessToken`)에서 새 토큰 확인
- [ ] 새 토큰을 상태 관리에 저장
- [ ] 원래 요청을 새 토큰으로 재시도
- [ ] 새 토큰이 없으면 로그아웃 처리

---

## 🔍 동작 흐름

```
1. API 요청 (만료된 Access Token)
   ↓
2. 백엔드에서 401 에러 발생
   ↓
3. 백엔드에서 Refresh Token 확인 → 새 Access Token 발급
   ↓
4. 응답 헤더에 X-New-Access-Token 포함
   ↓
5. 프론트엔드 Interceptor에서 401 응답 감지
   ↓
6. 응답 헤더에서 새 토큰 추출
   ↓
7. 새 토큰을 상태에 저장
   ↓
8. 원래 요청을 새 토큰으로 재시도
   ↓
9. 성공적으로 응답 받음 ✅
```

---

## ⚠️ 주의사항

1. **무한 루프 방지**: `_retry` 플래그를 사용하여 재시도는 한 번만 수행
2. **withCredentials**: Axios 설정에서 `withCredentials: true` 필수 (Refresh Token 쿠키 전송)
3. **토큰 저장 위치**: 프로젝트 구조에 맞게 상태 관리 라이브러리 선택
4. **로그아웃 처리**: 새 토큰이 없으면 Refresh Token도 만료된 것이므로 로그아웃 처리

---

## 📊 테스트 시나리오

1. **정상 요청**: Access Token이 유효한 경우 → 정상 동작
2. **토큰 만료 + 자동 갱신**: Access Token 만료 → 자동 갱신 → 재시도 성공
3. **Refresh Token 만료**: Access Token 만료 + Refresh Token 만료 → 로그아웃

---

이 가이드를 참고하여 프론트엔드에 토큰 자동 갱신 로직을 구현하세요! 🚀

