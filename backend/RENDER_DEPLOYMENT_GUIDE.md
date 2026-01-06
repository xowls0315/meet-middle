# Render 배포 가이드

## 📋 Render 설정 가이드

### 1. 서비스 타입
- **Web Service** 선택

### 2. 기본 설정

#### Name (서비스 이름)
```
meet-middle-backend
```

#### Region
- **Singapore** 또는 **Frankfurt** (가장 가까운 지역 선택)

#### Branch
- **main** 또는 **master** (기본 브랜치)

#### Root Directory
```
backend
```

---

## 🔧 Build & Start Commands

### Build Command
```bash
npm ci && npm run build
```

**또는**

```bash
npm install && npm run build
```

**⚠️ 중요**: 
- `npm ci`는 `package-lock.json`을 기반으로 정확한 버전 설치 (프로덕션 권장)
- Root Directory를 `backend`로 설정했으므로, `cd backend`는 필요 없습니다.

### Start Command
```bash
npm run start:prod
```

**⚠️ 중요**: 
- `start:prod`는 `node dist/main`을 실행
- 빌드된 `dist/` 폴더가 있어야 함
- `dist/` 폴더가 `.gitignore`에 포함되지 않았는지 확인

---

## 🔐 환경 변수 설정

Render 대시보드에서 **Environment** 섹션에 다음 환경 변수를 추가하세요:

### 필수 환경 변수

#### 1. 서버 설정
```
PORT=10000
```
**⚠️ 중요**: Render는 자동으로 PORT 환경 변수를 설정하지만, 명시적으로 설정하는 것을 권장합니다. Render의 기본 포트는 `10000`입니다.

```
NODE_ENV=production
```

```
BACKEND_URL=https://your-backend-service.onrender.com
```
**⚠️ 중요**: 배포 후 Render에서 제공하는 실제 URL로 변경하세요.

```
FRONTEND_URL=https://your-frontend-domain.com
```
**⚠️ 중요**: 프론트엔드 배포 URL로 변경하세요 (Vercel 등)

#### 2. 카카오 API 설정
```
KAKAO_REST_KEY=your_kakao_rest_api_key_here
```

```
KAKAO_CLIENT_ID=your_kakao_client_id_here
```

```
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
```

#### 3. 인증 설정
```
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_strong_random_string
```
**⚠️ 중요**: 프로덕션에서는 반드시 강력한 랜덤 문자열 사용!

```
JWT_ACCESS_EXPIRES_IN=15m
```
Access Token 만료 시간 (기본값: 15m)

```
JWT_REFRESH_EXPIRES_IN=14d
```
Refresh Token 만료 시간 (기본값: 14d)

#### 4. 쿠키 설정 (프로덕션 권장)
```
COOKIE_SECURE=true
```
HTTPS에서만 쿠키 전송 (프로덕션에서는 true 권장)

```
COOKIE_SAME_SITE=lax
```
쿠키 SameSite 설정 (lax | strict | none, 기본값: lax)

```
COOKIE_DOMAIN=.yourdomain.com
```
쿠키 도메인 설정 (선택사항, 서브도메인 간 공유 시 필요)

#### 5. 데이터베이스 설정
```
DB_URL=postgresql://user:password@host:port/database
```

**SSL 설정 (클라우드 DB 사용 시)**
```
DB_SSL=true
```
클라우드 데이터베이스(Neon, Supabase, Render 등) 사용 시 `true`로 설정 (기본값: 프로덕션에서 자동 활성화)

**Render PostgreSQL 사용 시**:
1. Render 대시보드에서 **New +** → **PostgreSQL** 생성
2. PostgreSQL 서비스의 **Internal Database URL** 또는 **External Database URL** 복사
3. `DB_URL`에 붙여넣기

**예시**:
```
DB_URL=postgresql://user:password@dpg-xxxxx-a.singapore-postgres.render.com/meet_middle
```

---

## 📝 환경 변수 설정 순서

### 1단계: Render PostgreSQL 생성 (필요 시)
1. Render 대시보드 → **New +** → **PostgreSQL**
2. 이름: `meet-middle-db`
3. Region: 백엔드와 동일한 지역 선택
4. Database: `meet_middle`
5. User: `meet_middle_user`
6. 생성 후 **Internal Database URL** 복사

### 2단계: Web Service 생성
1. Render 대시보드 → **New +** → **Web Service**
2. GitHub 저장소 연결
3. 다음 설정 입력:

#### Basic Settings
- **Name**: `meet-middle-backend`
- **Region**: `Singapore` (또는 가장 가까운 지역)
- **Branch**: `main` (또는 기본 브랜치)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

#### Environment Variables
아래 환경 변수들을 모두 추가:

```
PORT=10000
NODE_ENV=production
BACKEND_URL=https://your-backend-service.onrender.com
FRONTEND_URL=https://your-frontend-domain.com
KAKAO_REST_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
JWT_SECRET=your_strong_jwt_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
DB_URL=postgresql://user:password@host:port/database
DB_SSL=true
```

### 3단계: 배포 후 설정
1. 배포 완료 후 Render에서 제공하는 URL 확인
2. `BACKEND_URL`을 실제 배포 URL로 업데이트
3. 카카오 개발자 콘솔에서 Redirect URI 업데이트:
   - `https://your-backend-service.onrender.com/api/auth/kakao/callback`

---

## 🔄 자동 배포 설정

### Auto-Deploy
- ✅ **Yes** (기본값)
- `main` 브랜치에 푸시하면 자동 배포

---

## ⚙️ 고급 설정 (선택사항)

### Health Check Path
```
/health
```

### Health Check Interval
```
300
```

---

## 🚨 주의사항

### 1. 무료 플랜 제한
- Render 무료 플랜은 **15분간 요청이 없으면 슬립 모드**로 전환됩니다.
- 첫 요청 시 **30초~1분** 정도 지연될 수 있습니다.
- 프로덕션에서는 유료 플랜 사용 권장

### 2. 환경 변수 보안
- ✅ 환경 변수는 Render 대시보드에서만 설정
- ❌ 코드에 하드코딩하지 마세요
- ❌ `.env` 파일을 Git에 커밋하지 마세요

### 3. 데이터베이스 연결
- Render PostgreSQL 사용 시 **Internal Database URL** 사용 권장 (더 빠름)
- 외부 PostgreSQL 사용 시 **External Database URL** 사용

### 4. CORS 설정
- `FRONTEND_URL`을 정확히 설정해야 프론트엔드에서 API 호출 가능
- 프로덕션 도메인과 개발 도메인 모두 허용하려면 코드 수정 필요

---

## 📊 배포 확인

### 1. 배포 로그 확인
Render 대시보드 → **Logs** 탭에서 배포 진행 상황 확인

### 2. 헬스체크
배포 완료 후 브라우저에서:
```
https://your-backend-service.onrender.com/health
```

예상 응답:
```json
{
  "status": "ok",
  "timestamp": "2024-01-06T12:00:00.000Z"
}
```

### 3. API 테스트
```
https://your-backend-service.onrender.com/api/search/suggest?q=강남역
```

---

## 🔧 문제 해결

### 빌드 실패
- **원인**: 의존성 설치 실패
- **해결**: `package.json`의 모든 의존성이 올바른지 확인

### 데이터베이스 연결 실패
- **원인**: `DB_URL`이 잘못되었거나 PostgreSQL이 실행되지 않음
- **해결**: 
  1. PostgreSQL 서비스가 실행 중인지 확인
  2. `DB_URL` 형식 확인
  3. 방화벽 설정 확인 (External URL 사용 시)

### CORS 에러
- **원인**: `FRONTEND_URL`이 잘못 설정됨
- **해결**: 
  1. `FRONTEND_URL`을 정확한 프론트엔드 URL로 설정
  2. 환경 변수 업데이트 후 서비스 재시작

### 카카오 로그인 실패
- **원인**: Redirect URI가 등록되지 않음
- **해결**: 
  1. 카카오 개발자 콘솔 접속
  2. 카카오 로그인 → Redirect URI에 배포 URL 추가:
     ```
     https://your-backend-service.onrender.com/api/auth/kakao/callback
     ```

---

## 📚 추가 리소스

- [Render 공식 문서](https://render.com/docs)
- [Render Node.js 가이드](https://render.com/docs/node-version)
- [Render PostgreSQL 가이드](https://render.com/docs/databases)

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] GitHub 저장소에 코드 푸시 완료
- [ ] Render PostgreSQL 생성 (또는 외부 DB URL 준비)
- [ ] 모든 환경 변수 설정 완료
- [ ] 카카오 개발자 콘솔에서 Redirect URI 등록
- [ ] `BACKEND_URL`을 실제 배포 URL로 설정
- [ ] `FRONTEND_URL`을 실제 프론트엔드 URL로 설정
- [ ] `JWT_SECRET`을 강력한 랜덤 문자열로 설정
- [ ] Root Directory를 `backend`로 설정
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:prod`

