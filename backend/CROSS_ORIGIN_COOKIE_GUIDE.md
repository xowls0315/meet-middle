# Cross-Origin 쿠키 설정 가이드

## 🔴 문제 상황

프론트엔드(`localhost:3000`)에서 백엔드(`meet-middle-backend.onrender.com`)로 API 요청 시 쿠키가 전송되지 않아 401 에러가 발생하는 문제.

## ✅ 해결 완료

### 1. CORS 설정 수정 (`main.ts`)

```typescript
// 여러 프론트엔드 도메인 허용 가능
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000'];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // ⭐ 쿠키 전송 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
});
```

### 2. 쿠키 설정 수정 (`auth.controller.ts`)

```typescript
// 프로덕션 환경에서 자동으로 cross-origin 쿠키 설정 적용
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  // cross-origin 요청에서 쿠키 전송을 위해 'none' 사용
  sameSite: isProduction ? 'none' : 'lax',
  // sameSite: 'none'일 때는 secure: true 필수
  secure: isProduction,
  // 백엔드 도메인에 쿠키 설정
  domain: process.env.COOKIE_DOMAIN || undefined,
  path: '/',
};
```

## 🔧 Render 환경변수 설정

Render 대시보드에서 다음 환경변수를 설정하세요:

| Key | Value | 설명 |
|-----|-------|------|
| `NODE_ENV` | `production` | 프로덕션 모드 (자동으로 sameSite=none, secure=true 적용) |
| `FRONTEND_URL` | `http://localhost:3000` | 프론트엔드 URL (CORS 허용) |
| `COOKIE_DOMAIN` | `.onrender.com` | 쿠키 도메인 (선택사항) |
| `BACKEND_URL` | `https://meet-middle-backend.onrender.com` | 백엔드 URL |

### 여러 프론트엔드 도메인 허용

```env
FRONTEND_URL=http://localhost:3000,https://your-frontend.vercel.app
```

## 📋 체크리스트

### 백엔드 (완료됨)
- [x] 쿠키 `sameSite`가 프로덕션에서 `'none'`으로 설정
- [x] 쿠키 `secure`가 프로덕션에서 `true`로 설정
- [x] 쿠키 `domain`이 환경변수로 설정 가능
- [x] CORS에서 `credentials: true` 설정
- [x] CORS에서 프론트엔드 도메인 허용

### Render 환경변수 (설정 필요)
- [ ] `NODE_ENV=production` 설정
- [ ] `FRONTEND_URL` 설정 (프론트엔드 도메인)
- [ ] `COOKIE_DOMAIN` 설정 (선택: `.onrender.com`)

## 🧪 테스트 방법

### 1. 환경변수 설정 후 서버 재시작

Render에서 환경변수 설정 후 자동으로 재배포됩니다.

### 2. 브라우저에서 확인

1. 프론트엔드에서 카카오 로그인 실행
2. 개발자 도구 → Application → Cookies
3. `meet-middle-backend.onrender.com` 도메인에 쿠키 확인
4. API 요청 시 쿠키가 전송되는지 Network 탭에서 확인

### 3. 프론트엔드 코드 확인

프론트엔드에서 API 호출 시 `credentials: 'include'` 옵션이 필요합니다:

```typescript
// fetch 사용 시
const response = await fetch('https://meet-middle-backend.onrender.com/api/auth/me', {
  credentials: 'include', // ⭐ 필수
});

// axios 사용 시
axios.defaults.withCredentials = true; // 전역 설정
// 또는
const response = await axios.get('https://meet-middle-backend.onrender.com/api/auth/me', {
  withCredentials: true, // ⭐ 필수
});
```

## ⚠️ 주의사항

### 1. HTTPS 필수
- `sameSite: 'none'`을 사용하려면 `secure: true`가 필수
- `secure: true`는 HTTPS 환경에서만 작동
- Render는 기본적으로 HTTPS 제공

### 2. 도메인 설정
- `COOKIE_DOMAIN=.onrender.com`으로 설정하면 모든 onrender.com 서브도메인에서 쿠키 공유
- 특정 서브도메인만 허용하려면 정확한 도메인 입력

### 3. 로컬 개발 환경
- 로컬에서는 `sameSite: 'lax'`가 기본값
- 로컬에서 cross-origin 테스트 시 `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true` 설정 필요
- 단, 로컬 HTTP에서는 `secure: true` 쿠키가 작동하지 않음

## 🔄 변경사항 요약

### `main.ts`
- CORS origin을 함수로 변경하여 여러 도메인 허용
- `methods`, `allowedHeaders`, `exposedHeaders` 추가

### `auth.controller.ts`
- 쿠키 설정을 공통 옵션으로 리팩토링
- 프로덕션 환경에서 자동으로 `sameSite: 'none'`, `secure: true` 적용
- `path: '/'` 추가

### `ENV_SETUP_GUIDE.md`
- Cross-Origin 쿠키 관련 환경변수 설명 추가
- Render 배포 환경 예시 추가

---

이 가이드를 따라 Render 환경변수를 설정하면 cross-origin 쿠키 문제가 해결됩니다! 🚀

