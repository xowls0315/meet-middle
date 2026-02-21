# Meet-Middle 백엔드 Render 배포 가이드

## 1. Render에서 할 일 요약

1. **PostgreSQL 데이터베이스** 생성 (또는 기존 DB 사용)
2. **Web Service** 생성 (백엔드 코드 배포)
3. **환경 변수** 설정
4. **카카오 개발자 콘솔** Redirect URI 등록

---

## 2. PostgreSQL 데이터베이스 (Render)

- [Render Dashboard](https://dashboard.render.com) → **New +** → **PostgreSQL**
- Region 등 설정 후 생성
- 생성 후 **Info** 탭에서 다음 정보 확인:
  - **Internal Database URL** (같은 Render 서비스끼리만 사용 가능, 권장)
  - 또는 **External Database URL** (외부에서 접속 시)
- Web Service와 같은 Render 계정이면 **Internal URL** 사용 권장 (보안·안정성)

### DB 스키마 생성 (선택)

- 기본 스키마 `public` 사용 시 별도 작업 없음
- 별도 스키마 사용 시(예: `meet-middle`) PostgreSQL 클라이언트로 접속 후:
  ```sql
  CREATE SCHEMA IF NOT EXISTS "meet-middle";
  ```
- 프로젝트에서 `DB_SCHEMA=meet-middle` 로 설정해 두었다면 위 스키마가 있어야 함

---

## 3. Web Service 생성 (백엔드)

1. **New +** → **Web Service**
2. 저장소 연결: GitHub 등에서 `meet-middle` (또는 백엔드가 있는 저장소) 선택
3. **Root Directory**: 백엔드가 루트가 아니면 지정 (예: `meet-middle/backend`)
4. 설정:
   - **Name**: 예) `meet-middle-backend`
   - **Region**: DB와 가까운 곳 (예: Singapore)
   - **Branch**: `main` 등
   - **Runtime**: **Node**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free 또는 유료

---

## 4. 환경 변수 (Environment Variables)

Render Web Service → **Environment** 탭에서 아래 변수들을 추가합니다.

### 4.1 필수 환경 변수

| 변수명 | 설명 | 예시 (실제 값은 비공개로 설정) |
|--------|------|--------------------------------|
| `NODE_ENV` | 실행 환경 | `production` |
| `PORT` | Render가 할당 (보통 자동 설정) | 설정하지 않아도 됨 (Render 기본값 사용) |
| `BACKEND_URL` | 백엔드 공개 URL | `https://meet-middle-backend.onrender.com` |
| `FRONTEND_URL` | 프론트엔드 URL (CORS·리다이렉트용) | `https://meet-middle-frontend.vercel.app` |
| `DB_HOST` | PostgreSQL 호스트 | Render DB의 **Internal** 호스트명 |
| `DB_PORT` | PostgreSQL 포트 | `5432` |
| `DB_USERNAME` | DB 사용자명 | Render DB 정보에서 복사 |
| `DB_PASSWORD` | DB 비밀번호 | Render DB 정보에서 복사 |
| `DB_DATABASE` | DB 이름 | Render DB 정보에서 복사 |
| `DB_SCHEMA` | 스키마 (기본 사용 시 생략 가능) | `public` 또는 `meet-middle` |
| `DB_SSL` | SSL 사용 여부 | `true` (Render DB는 SSL 필수) |
| `JWT_SECRET` | JWT 서명용 비밀키 | **32자 이상** 랜덤 문자열 (절대 공개 금지) |
| `KAKAO_CLIENT_ID` | 카카오 REST API 키 (앱 키) | 카카오 개발자 콘솔에서 복사 |
| `KAKAO_CLIENT_SECRET` | 카카오 Client Secret | 카카오 개발자 콘솔에서 복사 |
| `KAKAO_REST_KEY` | 카카오 REST API 키 (KAKAO_CLIENT_ID와 동일해도 됨) | 카카오 개발자 콘솔에서 복사 |

### 4.2 선택 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `JWT_ACCESS_EXPIRES_IN` | Access Token 유효 시간 | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token 유효 시간 | `14d` |

### 4.3 JWT_SECRET 생성 예시 (로컬 터미널)

```bash
# Node로 32자 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- 생성한 값을 Render 환경 변수 `JWT_SECRET`에 **한 번만** 설정하고, 코드/문서에 붙여넣지 마세요.

### 4.4 Render PostgreSQL 내부 연결 (Internal URL 사용 시)

- Render DB 생성 시 **Internal Database URL**이 다음 형식으로 주어집니다:
  - `postgres://USER:PASSWORD@HOST/DATABASE?options=...`
- 이를 분리해서 다음처럼 넣을 수 있습니다:
  - `DB_HOST`: URL의 호스트 부분 (예: `dpg-xxxxx-a.singapore-postgres.render.com`)
  - `DB_USERNAME`: USER
  - `DB_PASSWORD`: PASSWORD
  - `DB_DATABASE`: DATABASE
  - `DB_PORT`: `5432`
  - `DB_SSL`: `true`
- **같은 Render 계정의 Web Service**에서만 Internal URL 호스트를 사용할 수 있습니다.

---

## 5. 카카오 개발자 콘솔 설정

1. [Kakao Developers](https://developers.kakao.com) → 앱 선택 → **앱 설정** → **앱 키**
2. **REST API 키** 확인 (이걸 `KAKAO_CLIENT_ID`, `KAKAO_REST_KEY`에 사용)
3. **앱 설정** → **플랫폼** → **Web** 플랫폼 등록
   - 사이트 도메인: `https://meet-middle-frontend.vercel.app` (실제 프론트 도메인으로 변경)
4. **제품 설정** → **카카오 로그인** → **활성화**
5. **카카오 로그인** → **Redirect URI**에 아래 주소 **정확히** 등록:
   - `https://meet-middle-backend.onrender.com/api/auth/kakao/callback`
   - 실제 백엔드 URL이 다르면 그에 맞게 수정 (경로는 `/api/auth/kakao/callback` 유지)

Redirect URI는 인증 요청 시 사용하는 `BACKEND_URL`과 일치해야 하며, 프로토콜(https), 호스트, 경로가 모두 같아야 합니다.

---

## 6. CORS (프론트엔드 도메인)

- `main.ts`에서 `origin`에 프론트엔드 URL이 하드코딩되어 있음:
  - `https://meet-middle-frontend.vercel.app`
  - `http://localhost:3000`
- Render에 배포한 프론트를 다른 도메인으로 쓰면, 백엔드 코드에서 해당 도메인을 `origin`에 추가하거나, 환경 변수로 CORS origin을 받도록 수정해야 합니다.

---

## 7. 쿠키 (프로덕션)

- `auth.controller.ts`의 `getCookieOptions()`:
  - `NODE_ENV=production` 이면 `secure: true`, `sameSite: 'none'`
- **HTTPS**와 **SameSite=None** 이어야 크로스 오리진(프론트와 백엔드 도메인 다른 경우)에서 쿠키 전송이 됩니다.
- Render는 기본적으로 HTTPS를 제공하므로, 백엔드 URL을 `https://`로 두면 됩니다.

---

## 8. 배포 후 확인

1. **Health / 루트**
   - `https://meet-middle-backend.onrender.com/` 또는 앱에서 정의한 루트 경로
2. **Swagger**
   - `https://meet-middle-backend.onrender.com/api-docs`
3. **카카오 로그인**
   - 프론트에서 카카오 로그인 시도 → 백엔드로 리다이렉트 → 로그인 후 프론트로 돌아오는지 확인
4. **로그**
   - Render **Logs** 탭에서 `Missing required environment variables` 등 에러 메시지 확인

---

## 9. 체크리스트

- [ ] Render PostgreSQL 생성 후 Internal(또는 External) 연결 정보 확인
- [ ] Web Service Root Directory가 백엔드 디렉터리인지 확인
- [ ] Build: `npm install && npm run build`, Start: `npm run start:prod`
- [ ] `NODE_ENV=production` 설정
- [ ] `BACKEND_URL` = Render Web Service URL (https)
- [ ] `FRONTEND_URL` = 실제 프론트엔드 URL (https)
- [ ] DB 관련 변수 5개 + `DB_SSL=true`, (선택) `DB_SCHEMA`
- [ ] `JWT_SECRET` 32자 이상 랜덤 문자열
- [ ] 카카오 `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REST_KEY` 설정
- [ ] 카카오 Redirect URI에 `{BACKEND_URL}/api/auth/kakao/callback` 등록
- [ ] 프론트엔드에서 `NEXT_PUBLIC_BACKEND_URL`(또는 해당 변수)에 Render 백엔드 URL 설정

이 문서는 `meet-middle/backend` 기준이며, 실제 서비스명·도메인은 환경에 맞게 바꿔 사용하면 됩니다.
