# 로그인하지 않은 상태에서 401 에러 발생 문제 해결 가이드

## 🔴 문제 상황

로그인하지 않은 상태에서 콘솔에 다음 에러가 반복적으로 출력됩니다:
```
GET /api/auth/token 401 (Unauthorized)
GET /api/auth/me 401 (Unauthorized)
```

기능에는 문제가 없지만, 불필요한 에러 로그가 계속 표시됩니다.

## 🔍 원인

프론트엔드의 `useAuth` 훅에서 Refresh Token 쿠키 존재 여부를 확인하지 않고 항상 `/api/auth/token` API를 호출하기 때문입니다.

## ✅ 해결 방법

### 방법 1: 쿠키 확인 후 API 호출 (권장)

Refresh Token 쿠키가 있을 때만 토큰 요청을 시도합니다.

```typescript
// 쿠키 확인 헬퍼 함수
function hasRefreshTokenCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(cookie => 
    cookie.trim().startsWith('refresh_token=')
  );
}

// restoreAccessToken 함수 수정
async function restoreAccessToken() {
  try {
    // Refresh Token 쿠키가 있는지 먼저 확인
    if (!hasRefreshTokenCookie()) {
      return null;
    }

    const response = await axios.get('/api/auth/token', {
      withCredentials: true,
    });
    
    return response.data.accessToken;
  } catch (error) {
    // 401 에러는 조용히 처리 (로그인하지 않은 상태)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

// useAuth 훅에서 사용
useEffect(() => {
  const loadUser = async () => {
    // 쿠키가 없으면 아무것도 하지 않음
    if (!hasRefreshTokenCookie()) {
      return;
    }

    try {
      const accessToken = await restoreAccessToken();
      
      if (accessToken) {
        await getCurrentUser();
      }
    } catch (error) {
      // 에러는 조용히 처리
      console.debug('User not authenticated');
    }
  };

  loadUser();
}, []);
```

### 방법 2: Axios Interceptor로 401 에러 조용히 처리

```typescript
// axios interceptor 설정
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러는 로그인하지 않은 상태이므로 조용히 처리
    if (error.response?.status === 401 && 
        error.config?.url?.includes('/api/auth/token')) {
      // 콘솔 에러 출력하지 않음
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);
```

### 방법 3: try-catch로 에러 무시

```typescript
useEffect(() => {
  const loadUser = async () => {
    try {
      const accessToken = await restoreAccessToken();
      if (accessToken) {
        await getCurrentUser();
      }
    } catch (error) {
      // 401 에러는 정상적인 상황 (로그인하지 않은 상태)
      // 에러를 출력하지 않음
    }
  };

  loadUser();
}, []);
```

## 📝 권장 사항

**방법 1 (쿠키 확인 후 API 호출)**을 권장합니다:
- ✅ 불필요한 네트워크 요청을 방지합니다
- ✅ 서버 부하를 줄입니다
- ✅ 콘솔 에러가 발생하지 않습니다

## ⚠️ 참고사항

- 백엔드 코드 수정은 **필요 없습니다**
- 현재 백엔드 동작은 정상입니다 (쿠키가 없으면 401 반환)
- 프론트엔드에서 쿠키 존재 여부를 먼저 확인하는 것이 가장 효율적입니다

