# 프론트엔드 인증 구조 변경 가이드

## 📋 개요

백엔드 인증 구조가 변경되었습니다. Access Token은 이제 쿠키가 아닌 메모리(state)에 저장되며, 모든 API 호출에 `Authorization` 헤더가 필요합니다.

---

## 🔄 주요 변경 사항

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| **Access Token 저장** | HttpOnly 쿠키 (자동 전송) | 메모리/state (수동 관리) |
| **Refresh Token 저장** | HttpOnly 쿠키 | HttpOnly 쿠키 (변경 없음) |
| **API 호출** | 쿠키 자동 전송 | `Authorization: Bearer {token}` 헤더 필수 |
| **로그인 성공** | 쿠키 자동 설정 | `/api/auth/token` 호출 필요 |
| **토큰 갱신** | 쿠키 자동 갱신 | `{ accessToken }` 받아서 state에 저장 |
| **새로고침** | 쿠키 자동 사용 | `/api/auth/token` 호출 필요 |

---

## 🚀 필수 수정 사항

### 1. 로그인 성공 후 Access Token 받기

#### 프로덕션 환경

```typescript
// 로그인 성공 후 처리
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const loginStatus = urlParams.get('login');
  
  if (loginStatus === 'success') {
    // ⭐ 프로덕션: /api/auth/token 호출하여 Access Token 받기
    fetch(`${BACKEND_URL}/api/auth/token`, {
      method: 'GET',
      credentials: 'include', // Refresh Token 쿠키 전송 필수
    })
      .then(res => res.json())
      .then(data => {
        const { accessToken } = data;
        // Access Token을 state에 저장
        setAccessToken(accessToken);
        // URL 정리 (보안)
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(error => {
        console.error('Access Token 발급 실패:', error);
        // 로그인 실패 처리
      });
  }
}, []);
```

#### 개발 환경

```typescript
// 로그인 성공 후 처리
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const loginStatus = urlParams.get('login');
  const accessToken = urlParams.get('access_token');
  
  if (loginStatus === 'success') {
    if (accessToken) {
      // ⭐ 개발 환경: URL 파라미터에서 Access Token 추출
      setAccessToken(accessToken);
      // URL 정리 (보안)
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // 프로덕션 환경: /api/auth/token 호출
      fetch(`${BACKEND_URL}/api/auth/token`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setAccessToken(data.accessToken);
          window.history.replaceState({}, '', window.location.pathname);
        });
    }
  }
}, []);
```

---

### 2. 모든 API 호출에 Authorization 헤더 추가

#### 변경 전

```typescript
// ❌ 기존 방식 (쿠키 자동 전송)
fetch(`${BACKEND_URL}/api/auth/me`, {
  credentials: 'include',
});
```

#### 변경 후

```typescript
// ✅ 새로운 방식 (Authorization 헤더 필수)
const accessToken = getAccessToken(); // state에서 가져오기

fetch(`${BACKEND_URL}/api/auth/me`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`, // ⭐ 필수
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Refresh Token 쿠키 전송
})
  .then(res => res.json())
  .then(user => {
    console.log('사용자 정보:', user);
  });
```

---

### 3. Access Token 만료 시 자동 갱신

#### 변경 전

```typescript
// ❌ 기존 방식: 쿠키에 자동으로 새 토큰 저장
fetch(`${BACKEND_URL}/api/auth/refresh`, {
  method: 'POST',
  credentials: 'include',
});
// 쿠키에 자동 저장됨
```

#### 변경 후

```typescript
// ✅ 새로운 방식: 새 토큰을 state에 저장
async function callApiWithAutoRefresh(url: string, options: RequestInit = {}) {
  const accessToken = getAccessToken();
  
  // 첫 번째 시도
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  // 401 에러 시 Access Token 갱신
  if (response.status === 401) {
    try {
      // Refresh Token으로 새 Access Token 발급
      const refreshResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Refresh Token 쿠키 전송
      });

      if (refreshResponse.ok) {
        const { accessToken: newAccessToken } = await refreshResponse.json();
        
        // ⭐ 새 Access Token을 state에 저장
        setAccessToken(newAccessToken);

        // 새 Access Token으로 재시도
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
          credentials: 'include',
        });
      } else {
        // Refresh Token도 만료 → 로그아웃
        handleLogout();
        throw new Error('Session expired');
      }
    } catch (error) {
      handleLogout();
      throw error;
    }
  }

  return response;
}
```

---

### 4. 새로고침 시 Access Token 복원

```typescript
// ⭐ 새로고침 시 Access Token이 state에 없으면 /api/auth/token 호출
useEffect(() => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    // Access Token이 없으면 Refresh Token으로 발급받기
    fetch(`${BACKEND_URL}/api/auth/token`, {
      method: 'GET',
      credentials: 'include', // Refresh Token 쿠키 전송
    })
      .then(res => res.json())
      .then(data => {
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          // 로그인 상태 복원
          setIsAuthenticated(true);
        } else {
          // Refresh Token도 없음 → 로그아웃 상태
          setIsAuthenticated(false);
        }
      })
      .catch(error => {
        console.error('Access Token 발급 실패:', error);
        setIsAuthenticated(false);
      });
  }
}, []);
```

---

### 5. 로그아웃 처리

```typescript
// ⭐ Access Token은 state에서 제거, Refresh Token은 서버에서 제거
const handleLogout = async () => {
  const accessToken = getAccessToken();
  
  try {
    // 로그아웃 API 호출 (Refresh Token 쿠키 제거)
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
  } catch (error) {
    console.error('로그아웃 실패:', error);
  } finally {
    // ⭐ Access Token을 state에서 제거
    setAccessToken(null);
    setIsAuthenticated(false);
    
    // 카카오 로그아웃 URL로 리다이렉트 (서버에서 처리)
  }
};
```

---

## 🛠️ API 호출 유틸리티 함수

```typescript
// API 호출 유틸리티 함수 (자동 토큰 갱신 포함)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = getAccessToken();
  
  // 첫 번째 시도
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
    credentials: 'include',
  });

  // 401 에러 시 Access Token 갱신
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const { accessToken: newAccessToken } = await refreshResponse.json();
        setAccessToken(newAccessToken);

        // 재시도
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newAccessToken}`,
            ...options.headers,
          },
          credentials: 'include',
        });
      } else {
        // Refresh Token도 만료
        setAccessToken(null);
        setIsAuthenticated(false);
        throw new Error('Session expired');
      }
    } catch (error) {
      setAccessToken(null);
      setIsAuthenticated(false);
      throw error;
    }
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// 사용 예시
const user = await apiCall('/api/auth/me');
const meetings = await apiCall('/api/meetings');
```

---

## 📋 API 엔드포인트 요약

### 인증 관련 엔드포인트

| 엔드포인트 | 메서드 | 설명 | 요청 | 응답 |
|-----------|--------|------|------|------|
| `/api/auth/kakao` | GET | 카카오 로그인 시작 | - | 리다이렉트 |
| `/api/auth/kakao/callback` | GET | 카카오 로그인 콜백 | - | 리다이렉트 |
| `/api/auth/token` | GET | Access Token 발급 | - | `{ accessToken: "..." }` |
| `/api/auth/refresh` | POST | Access Token 갱신 | - | `{ accessToken: "..." }` |
| `/api/auth/me` | GET | 사용자 정보 조회 | `Authorization: Bearer {token}` | `{ id, name, email, profileImage }` |
| `/api/auth/logout` | POST | 로그아웃 | `Authorization: Bearer {token}` | 리다이렉트 |

---

## ✅ 필수 체크리스트

- [ ] 로그인 성공 후 `/api/auth/token` 호출하여 Access Token 받기
- [ ] 모든 API 호출에 `Authorization: Bearer {token}` 헤더 추가
- [ ] Access Token을 state에 저장 (localStorage도 가능)
- [ ] 401 에러 시 `/api/auth/refresh` 호출 후 새 토큰을 state에 저장
- [ ] 새로고침 시 `/api/auth/token` 호출하여 토큰 복원
- [ ] 모든 API 호출에 `credentials: 'include'` 유지 (Refresh Token 쿠키 전송)
- [ ] 로그아웃 시 Access Token을 state에서 제거

---

## ⚠️ 주의사항

### 1. Access Token은 쿠키에 저장되지 않음

- 모든 API 호출에 `Authorization: Bearer {token}` 헤더가 **필수**입니다.
- 쿠키를 기대하는 기존 코드는 수정이 필요합니다.

### 2. Refresh Token은 HttpOnly 쿠키

- Refresh Token은 JavaScript로 접근할 수 없습니다.
- `credentials: 'include'`로 자동 전송됩니다.
- 수동으로 관리할 필요가 없습니다.

### 3. 프로덕션 vs 개발 환경

- **프로덕션**: URL 파라미터에 Access Token 없음 → `/api/auth/token` 호출 필요
- **개발 환경**: URL 파라미터에 Access Token 있음 (선택적)

### 4. 토큰 갱신 응답 형식 변경

- **변경 전**: `{ success: true }`
- **변경 후**: `{ accessToken: "..." }`
- 새 토큰을 state에 저장해야 합니다.

---

## 🔍 문제 해결

### Access Token이 없는 경우

```typescript
// 새로고침 시 또는 로그인 직후
if (!accessToken) {
  const response = await fetch(`${BACKEND_URL}/api/auth/token`, {
    credentials: 'include',
  });
  
  if (response.ok) {
    const { accessToken } = await response.json();
    setAccessToken(accessToken);
  } else {
    // Refresh Token도 없음 → 로그아웃 상태
    setIsAuthenticated(false);
  }
}
```

### 401 에러 발생 시

```typescript
if (response.status === 401) {
  // Access Token 갱신 시도
  const refreshResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  
  if (refreshResponse.ok) {
    const { accessToken: newToken } = await refreshResponse.json();
    setAccessToken(newToken);
    // 재시도
  } else {
    // Refresh Token도 만료 → 로그아웃
    handleLogout();
  }
}
```

---

## 📚 참고 자료

- 백엔드 Swagger UI: `https://your-backend-service.onrender.com/api-docs`
- 백엔드 API 문서: `FRONTEND_DEPLOYMENT_GUIDE.md`

---

## 💡 추가 팁

### Access Token 저장 위치

- **메모리 (state)**: 새로고침 시 사라짐 → `/api/auth/token` 호출 필요
- **localStorage**: 새로고침 후에도 유지 (선택적)

```typescript
// localStorage 사용 예시
const setAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
  setState(token);
};

const getAccessToken = () => {
  return localStorage.getItem('accessToken') || state;
};
```

### 환경 변수 설정

```env
REACT_APP_BACKEND_URL=https://your-backend-service.onrender.com
```

---

**문의사항이 있으면 백엔드 개발자에게 연락하세요!**

