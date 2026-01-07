# 백엔드 쿠키 설정 수정 가이드

## 🔴 문제 상황

현재 프론트엔드(`localhost:3000`)에서 백엔드(`meet-middle-backend.onrender.com`)로 API 요청 시 쿠키가 전송되지 않아 401 에러가 발생합니다.

## 🔍 원인

1. **쿠키 도메인 불일치**: 쿠키가 `localhost:3000`에 설정되어 있지만, API 요청은 `meet-middle-backend.onrender.com`으로 전송됩니다.
2. **SameSite=Lax**: SameSite=Lax 쿠키는 cross-origin 요청에서 자동으로 전송되지 않습니다.
3. **CORS 설정**: 백엔드 CORS 설정에서 `credentials: true`가 허용되어야 합니다.

## ✅ 해결 방법 (백엔드 수정 필요)

### 1. 쿠키를 백엔드 도메인에 설정

백엔드가 카카오 로그인 콜백 후 쿠키를 설정할 때, **백엔드 도메인**에 설정해야 합니다:

```typescript
// ❌ 잘못된 방법 (프론트엔드 도메인에 쿠키 설정)
res.cookie("access_token", token, {
  domain: "localhost", // 또는 프론트엔드 도메인
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});

// ✅ 올바른 방법 (백엔드 도메인에 쿠키 설정)
res.cookie("access_token", token, {
  domain: ".onrender.com", // 또는 백엔드 도메인
  httpOnly: true,
  secure: true, // HTTPS 필수
  sameSite: "none", // cross-origin 요청 허용
  path: "/",
  maxAge: 15 * 60 * 1000, // 15분
});

res.cookie("refresh_token", refreshToken, {
  domain: ".onrender.com",
  httpOnly: true,
  secure: true,
  sameSite: "none", // cross-origin 요청 허용
  path: "/",
  maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
});
```

**중요**:

- `domain`을 백엔드 도메인(`.onrender.com`)으로 설정
- `sameSite: 'none'`으로 설정하여 cross-origin 요청에서 쿠키 전송 허용
- `secure: true`는 HTTPS 환경에서만 작동 (프로덕션 필수)

### 2. CORS 설정 수정

백엔드 CORS 설정에서 프론트엔드 도메인과 `credentials: true`를 허용해야 합니다:

```typescript
// NestJS 예시
app.enableCors({
  origin: [
    "http://localhost:3000", // 개발 환경
    "https://your-frontend-domain.com", // 프로덕션 환경
  ],
  credentials: true, // ⭐ 중요: 쿠키 전송 허용
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

### 3. 카카오 로그인 콜백 수정

로그인 성공 후 프론트엔드로 리다이렉트할 때, 쿠키가 백엔드 도메인에 설정되도록 해야 합니다:

```typescript
@Get('/kakao/callback')
async kakaoCallback(@Query('code') code: string, @Res() res: Response) {
  // 카카오 인증 처리
  const { accessToken, refreshToken } = await this.authService.kakaoLogin(code);

  // 쿠키를 백엔드 도메인에 설정
  res.cookie('access_token', accessToken, {
    domain: '.onrender.com', // 백엔드 도메인
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 15 * 60 * 1000
  });

  res.cookie('refresh_token', refreshToken, {
    domain: '.onrender.com',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 14 * 24 * 60 * 60 * 1000
  });

  // 프론트엔드로 리다이렉트
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/?login=success`);
}
```

## 🔧 환경 변수 설정

백엔드 `.env` 파일에 프론트엔드 URL 추가:

```env
FRONTEND_URL=http://localhost:3000
# 프로덕션
# FRONTEND_URL=https://your-frontend-domain.com
```

## 📋 체크리스트

백엔드 개발자가 확인해야 할 사항:

- [ ] 쿠키 `domain`이 백엔드 도메인(`.onrender.com`)으로 설정되어 있는가?
- [ ] 쿠키 `sameSite`가 `'none'`으로 설정되어 있는가?
- [ ] 쿠키 `secure`가 `true`로 설정되어 있는가? (HTTPS 환경)
- [ ] CORS에서 `credentials: true`가 설정되어 있는가?
- [ ] CORS에서 프론트엔드 도메인(`localhost:3000`)이 허용되어 있는가?
- [ ] 환경 변수 `FRONTEND_URL`이 설정되어 있는가?

## 🧪 테스트 방법

백엔드 수정 후:

1. 브라우저 개발자 도구 → Application → Cookies
2. `meet-middle-backend.onrender.com` 도메인에 쿠키가 설정되어 있는지 확인
3. 프론트엔드에서 로그인 후 헤더에 사용자 정보가 표시되는지 확인

## ⚠️ 참고 사항

- **로컬 개발 환경**: `localhost`에서 테스트할 때는 `sameSite: 'lax'`도 작동할 수 있지만, cross-origin 환경에서는 `'none'`이 필요합니다.
- **프로덕션 환경**: HTTPS가 필수이며, `secure: true` 설정이 필요합니다.
- **도메인 설정**: `.onrender.com`과 같이 서브도메인을 포함하려면 앞에 `.`을 붙입니다.

---

이 가이드를 백엔드 개발자에게 전달하여 수정 요청하세요!
