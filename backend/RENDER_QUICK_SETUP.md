# Render 배포 빠른 설정 가이드

## 🚀 Render 배포 필수 설정 (간략 버전)

### 1. Build & Start Commands

**Build Command:**
```
npm install --legacy-peer-deps && npm run build
```

⚠️ **중요**: `--legacy-peer-deps` 플래그가 필요합니다. `@nestjs/cache-manager@2.3.0`이 NestJS 11과 호환되지 않지만, 실제로는 정상 작동합니다.

**Start Command:**
```
npm run start:prod
```

**Root Directory:**
```
backend
```

---

### 2. 필수 환경 변수 (Environment Variables)

Render 대시보드 → **Environment** 섹션에 다음 변수들을 모두 추가:

```env
# 데이터베이스
DB_URL=postgresql://user:password@host:port/database
DB_SSL=true

# 카카오 API
KAKAO_REST_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# 서버 URL (⚠️ 배포 후 실제 URL로 변경!)
BACKEND_URL=https://your-backend-service.onrender.com
FRONTEND_URL=https://your-frontend-domain.com

# JWT (⚠️ 강력한 랜덤 문자열 사용!)
JWT_SECRET=your_very_secure_jwt_secret_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d

# 쿠키 설정 (프로덕션)
COOKIE_SECURE=true
COOKIE_SAME_SITE=none

# Node 환경
NODE_ENV=production
PORT=10000
```

---

### 3. 배포 후 필수 작업

#### 3.1 BACKEND_URL 업데이트
배포 완료 후 Render에서 제공하는 실제 URL로 `BACKEND_URL` 업데이트

#### 3.2 카카오 개발자 콘솔 설정
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. **제품 설정** → **카카오 로그인** → **Redirect URI**에 추가:
   ```
   https://your-backend-service.onrender.com/api/auth/kakao/callback
   ```
3. **로그아웃 리다이렉트 URI**에 추가:
   ```
   https://your-frontend-domain.com
   ```

---

### 4. 배포 확인

배포 완료 후 다음 URL로 확인:

1. **헬스 체크:**
   ```
   https://your-backend-service.onrender.com/health
   ```

2. **Swagger UI:**
   ```
   https://your-backend-service.onrender.com/api-docs
   ```

---

## ⚠️ 중요 체크리스트

- [ ] 모든 환경 변수 설정 완료
- [ ] `BACKEND_URL`을 실제 배포 URL로 업데이트
- [ ] 카카오 개발자 콘솔에 Redirect URI 등록
- [ ] 카카오 개발자 콘솔에 로그아웃 리다이렉트 URI 등록
- [ ] 헬스 체크 응답 확인
- [ ] Swagger UI 접속 확인

---

자세한 내용은 `RENDER_DEPLOYMENT_CHECKLIST.md`를 참고하세요.

