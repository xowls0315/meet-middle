# Render 배포 체크리스트 및 주의사항

## 🚨 Render 배포 전 필수 확인사항

### 1. 환경 변수 설정 (Environment Variables)

Render 대시보드에서 다음 환경 변수를 **반드시** 설정해야 합니다:

#### 필수 환경 변수

```env
# 데이터베이스
DB_URL=postgresql://user:password@host:port/database
DB_SSL=true

# 카카오 API
KAKAO_REST_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# 서버 URL
BACKEND_URL=https://your-backend-service.onrender.com
FRONTEND_URL=https://your-frontend-domain.com

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d

# 쿠키 설정 (프로덕션)
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_DOMAIN=your-domain.com

# Node 환경
NODE_ENV=production
PORT=10000
```

#### ⚠️ 중요 주의사항

1. **JWT_SECRET**: 최소 32자 이상의 강력한 랜덤 문자열 사용
2. **DB_SSL**: Render PostgreSQL은 `true`로 설정 필수
3. **COOKIE_SECURE**: 프로덕션에서는 반드시 `true`
4. **COOKIE_SAME_SITE**: HTTPS에서는 `none` 권장
5. **BACKEND_URL**: Render에서 제공하는 실제 URL 사용

---

### 2. Build Command

```
npm install --legacy-peer-deps && npm run build
```

**⚠️ 중요 주의사항**:
- `--legacy-peer-deps` 플래그가 **필수**입니다!
- `@nestjs/cache-manager@2.3.0`이 NestJS 11과 호환되지 않지만, 실제로는 정상 작동합니다.
- 이 플래그 없이는 빌드가 실패합니다.

---

### 3. Start Command

```
npm run start:prod
```

**주의사항**:
- `start:prod`는 `node dist/main`을 실행
- 빌드된 파일(`dist/`)이 있어야 함
- `dist/` 폴더가 `.gitignore`에 포함되지 않았는지 확인

---

### 4. PostgreSQL 데이터베이스 설정

#### Render PostgreSQL 생성 시

1. **데이터베이스 생성**
   - Render 대시보드에서 PostgreSQL 생성
   - **Internal Database URL** 복사

2. **SSL 연결 필수**
   - Render PostgreSQL은 SSL 연결 필수
   - `DB_SSL=true` 설정

3. **연결 확인**
   - 배포 후 로그에서 연결 성공 여부 확인

---

### 5. 카카오 개발자 콘솔 설정

#### Redirect URI 등록

카카오 개발자 콘솔 → 제품 설정 → 카카오 로그인 → Redirect URI:

```
https://your-backend-service.onrender.com/api/auth/kakao/callback
```

**주의사항**:
- 프로덕션 URL은 반드시 `https://` 사용
- 로컬과 프로덕션 URL 모두 등록 가능

---

### 6. CORS 설정

`main.ts`에서 CORS 설정 확인:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

**주의사항**:
- 프로덕션에서는 `FRONTEND_URL`을 정확히 설정
- `credentials: true` 필수 (쿠키 전송)

---

### 7. TypeORM Synchronize 설정

**프로덕션에서는 반드시 `false`**:

```typescript
synchronize: !isProduction, // 프로덕션에서는 false
```

**주의사항**:
- 프로덕션에서 `synchronize: true`는 위험
- 마이그레이션 사용 권장

---

### 8. 로깅 설정

프로덕션에서는 불필요한 로그 최소화:

```typescript
logging: process.env.NODE_ENV === 'development',
```

---

### 9. 포트 설정

Render는 자동으로 `PORT` 환경 변수를 제공합니다:

```typescript
const port = process.env.PORT || 3001;
```

**주의사항**:
- Render는 동적 포트 할당
- `process.env.PORT` 사용 필수

---

### 10. 빌드 시간 최적화

#### .dockerignore 또는 .gitignore 확인

불필요한 파일 제외:
```
node_modules/
dist/
.env
*.log
```

---

## 🔧 Render 배포 단계별 가이드

### 1단계: Render 서비스 생성

1. Render 대시보드 접속
2. **New** → **Web Service** 선택
3. GitHub 저장소 연결
4. 서비스 설정:
   - **Name**: `meet-middle-backend`
   - **Region**: `Seoul` (또는 가장 가까운 지역)
   - **Branch**: `main` (또는 배포할 브랜치)
   - **Root Directory**: `backend` (또는 프로젝트 루트)

### 2단계: Build & Start 명령어 설정

- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start:prod`

### 3단계: 환경 변수 설정

위의 "필수 환경 변수" 목록을 모두 설정

### 4단계: PostgreSQL 데이터베이스 연결

1. Render에서 PostgreSQL 생성
2. **Internal Database URL** 복사
3. 환경 변수 `DB_URL`에 설정
4. `DB_SSL=true` 설정

### 5단계: 배포 및 확인

1. **Deploy** 클릭
2. 배포 로그 확인
3. 에러 발생 시 로그 확인 및 수정

---

## 🚨 자주 발생하는 문제

### 문제 1: 데이터베이스 연결 실패

**증상**:
```
Error: SSL/TLS required
```

**해결**:
- `DB_SSL=true` 설정 확인
- `DB_URL`이 올바른지 확인

### 문제 2: 빌드 실패

**증상**:
```
npm ERR! code ERESOLVE
```

**해결**:
- `package-lock.json` 확인
- `npm ci` 사용
- `--legacy-peer-deps` 필요 시 사용

### 문제 3: 포트 바인딩 실패

**증상**:
```
Error: listen EADDRINUSE
```

**해결**:
- `process.env.PORT` 사용 확인
- 하드코딩된 포트 제거

### 문제 4: 카카오 로그인 실패

**증상**:
```
KOE006: 앱 관리자 설정 오류
```

**해결**:
- 카카오 개발자 콘솔에서 Redirect URI 확인
- 프로덕션 URL이 정확히 등록되었는지 확인

### 문제 5: CORS 에러

**증상**:
```
Access to fetch at ... has been blocked by CORS policy
```

**해결**:
- `FRONTEND_URL` 환경 변수 확인
- CORS 설정에서 `credentials: true` 확인

---

## 📋 배포 전 체크리스트

### 코드 검증
- [ ] `npm run build` 성공
- [ ] `npm run start:prod` 로컬에서 테스트
- [ ] TypeScript 컴파일 에러 없음
- [ ] Linter 에러 없음

### 환경 변수
- [ ] 모든 필수 환경 변수 설정
- [ ] `JWT_SECRET` 강력한 값으로 설정
- [ ] `DB_SSL=true` 설정
- [ ] `NODE_ENV=production` 설정

### 데이터베이스
- [ ] PostgreSQL 생성 완료
- [ ] `DB_URL` 정확히 설정
- [ ] 데이터베이스 연결 테스트

### 카카오 설정
- [ ] Redirect URI 등록 완료
- [ ] `KAKAO_CLIENT_ID` 설정
- [ ] `KAKAO_CLIENT_SECRET` 설정
- [ ] `KAKAO_REST_KEY` 설정

### 보안
- [ ] `COOKIE_SECURE=true` (프로덕션)
- [ ] `synchronize: false` (프로덕션)
- [ ] 민감한 정보 `.env`에만 저장

### 성능
- [ ] 불필요한 로깅 비활성화
- [ ] 캐시 설정 확인
- [ ] Rate Limiting 설정 확인

---

## 🔍 배포 후 확인사항

### 1. 헬스 체크
```
GET https://your-backend-service.onrender.com/health
```

예상 응답:
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T12:00:00.000Z"
}
```

### 2. Swagger UI 확인
```
https://your-backend-service.onrender.com/api-docs
```

### 3. 데이터베이스 연결 확인
- 배포 로그에서 연결 성공 메시지 확인
- 에러 없이 서버 시작 확인

### 4. 카카오 로그인 테스트
- 카카오 로그인 플로우 테스트
- 토큰 발급 확인

---

## 💡 최적화 팁

### 1. 빌드 시간 단축
- `.dockerignore` 사용
- 불필요한 파일 제외

### 2. 메모리 사용량 최적화
- 캐시 크기 조정
- 로깅 최소화

### 3. 시작 시간 단축
- 불필요한 초기화 로직 제거
- 비동기 초기화 사용

---

## 📞 문제 해결

배포 중 문제 발생 시:

1. **배포 로그 확인**: Render 대시보드 → Logs
2. **환경 변수 확인**: Settings → Environment
3. **데이터베이스 연결 확인**: PostgreSQL 대시보드
4. **카카오 설정 확인**: 카카오 개발자 콘솔

---

## ✅ 배포 완료 확인

배포가 성공적으로 완료되면:

- [ ] 헬스 체크 응답 확인
- [ ] Swagger UI 접근 가능
- [ ] 카카오 로그인 작동
- [ ] API 엔드포인트 정상 작동
- [ ] 데이터베이스 연결 정상

---

## 🔗 관련 문서

- [Render 공식 문서](https://render.com/docs)
- [NestJS 배포 가이드](https://docs.nestjs.com/recipes/deployment)
- [PostgreSQL SSL 연결](https://render.com/docs/databases#connecting-from-outside-render)

