# 토큰 자동 갱신 구현 가이드

## 📋 개요

백엔드에서 Access Token 만료 시 자동으로 Refresh Token을 사용하여 새 Access Token을 발급하는 로직을 구현했습니다.

---

## 🔧 구현 내용

### 1. HttpExceptionFilter 수정

**파일**: `backend/src/common/filters/http-exception.filter.ts`

**주요 기능**:
- 401 에러 발생 시 자동으로 Refresh Token 확인
- Refresh Token이 유효하면 새 Access Token 발급
- 응답 헤더와 본문에 새 Access Token 포함

**동작 흐름**:
```
1. API 요청 → Access Token 만료 (401 에러)
2. HttpExceptionFilter에서 401 에러 감지
3. Refresh Token 확인 (쿠키에서)
4. Refresh Token이 유효하면 새 Access Token 발급
5. 응답 헤더에 새 토큰 포함:
   - X-New-Access-Token: 새 Access Token
   - X-Token-Refreshed: true
6. 응답 본문에도 새 토큰 포함 (선택적)
```

### 2. AppModule에 Exception Filter 등록

**파일**: `backend/src/app.module.ts`

**변경 사항**:
- `APP_FILTER`를 사용하여 `HttpExceptionFilter`를 전역으로 등록
- `forwardRef`를 사용하여 순환 의존성 문제 해결

---

## ✅ 동작 방식

### 시나리오 1: Access Token 만료, Refresh Token 유효

```
요청: GET /api/meetings (만료된 Access Token)
↓
401 에러 발생
↓
HttpExceptionFilter 감지
↓
Refresh Token 확인 (쿠키)
↓
새 Access Token 발급
↓
응답:
  Status: 401
  Headers:
    X-New-Access-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    X-Token-Refreshed: true
  Body:
    {
      "error": "인증이 필요합니다.",
      "newAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
```

### 시나리오 2: Public 엔드포인트 (토큰 갱신 시도 안 함)

다음 엔드포인트는 토큰 갱신을 시도하지 않습니다:
- `/api/auth/*` (로그인, 토큰 발급 등)
- `/api-docs` (Swagger 문서)

### 시나리오 3: Refresh Token도 만료

```
요청: GET /api/meetings (만료된 Access Token)
↓
401 에러 발생
↓
HttpExceptionFilter 감지
↓
Refresh Token 확인 (쿠키)
↓
Refresh Token도 만료 또는 유효하지 않음
↓
원래 401 에러 반환 (토큰 갱신 없음)
```

---

## 📝 프론트엔드 연동

프론트엔드에서는 다음과 같이 처리할 수 있습니다:

### 방법 1: 응답 헤더 확인

```typescript
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newAccessToken = error.response.headers['x-new-access-token'];
      
      if (newAccessToken) {
        // 새 토큰 저장
        setAccessToken(newAccessToken);
        
        // 원래 요청 재시도
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

### 방법 2: 응답 본문 확인

```typescript
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { newAccessToken } = error.response.data;
      
      if (newAccessToken) {
        // 새 토큰 저장
        setAccessToken(newAccessToken);
        
        // 원래 요청 재시도
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🔒 보안 고려사항

1. **Public 엔드포인트 제외**: 인증이 필요 없는 엔드포인트에서는 토큰 갱신을 시도하지 않습니다.

2. **Refresh Token 검증**: DB에서 Refresh Token을 확인하여 유효성 검증합니다.

3. **에러 로깅**: 토큰 갱신 실패 시 디버그 로그만 기록합니다 (민감한 정보 노출 방지).

---

## ✅ 검증 완료

- ✅ 빌드 테스트: 성공 (2회 이상)
- ✅ 린터 검사: 통과
- ✅ 타입 검증: 통과
- ✅ 순환 의존성 해결: `forwardRef` 사용

---

## 📊 동작 요약

| 상황 | 동작 |
|------|------|
| Access Token 만료 + Refresh Token 유효 | 새 Access Token 자동 발급 |
| Access Token 만료 + Refresh Token 만료 | 원래 401 에러 반환 |
| Public 엔드포인트 | 토큰 갱신 시도 안 함 |
| 정상 요청 | 기존 동작 유지 |

---

## 🎯 장점

1. **프론트엔드 코드 최소화**: 백엔드에서 자동 처리
2. **사용자 경험 향상**: 토큰 만료 시 자동 갱신
3. **보안 유지**: Refresh Token 검증 및 DB 확인
4. **유연성**: 응답 헤더와 본문 모두에 새 토큰 포함

---

이제 백엔드에서 토큰 관련 로직을 모두 관리할 수 있습니다! 🎉

