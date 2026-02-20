# PC 교체 후 meet-middle 환경 설정 가이드

PC를 바꾼 뒤 DBeaver(PostgreSQL), 백엔드 .env, 카카오 개발자 설정, 프론트엔드 .env.local을 다시 맞추는 방법입니다.

---

## 1. 데이터베이스 (DBeaver + PostgreSQL)

### 1.1 PostgreSQL 준비

- PostgreSQL이 새 PC에 설치되어 있어야 합니다.
- 서버가 실행 중인지 확인하세요.

### 1.2 DBeaver에서 실행할 SQL

1. DBeaver 실행 → PostgreSQL에 연결(새 연결이면 호스트, 포트, DB명, 사용자/비밀번호 입력).
2. **데이터베이스 생성** (필요 시):  
   예) `meet_middle`  
   우클릭 → SQL 편집기 → 새 SQL 스크립트에서  
   `CREATE DATABASE meet_middle;` 실행 후 해당 DB에 연결.
3. **스키마 적용**:  
   `backend/database/final.sql` 파일을 열고,  
   DBeaver에서 **SQL 편집기**로 해당 파일을 열거나 내용을 붙여넣은 뒤 **전체 실행**(Ctrl+Enter 또는 실행 버튼).

### 1.3 final.sql 내용 요약

- UUID 생성 (PostgreSQL 13+ 기본 함수 사용)
- `users` (카카오 로그인 사용자 + refreshToken)
- `shares` (공유 링크)
- `meetings` (약속 기록, users 참조)
- `favorites` (즐겨찾기, users 참조)
- 필요한 인덱스

한 번만 실행하면 됩니다. 이미 테이블이 있으면 `IF NOT EXISTS` 때문에 에러 없이 넘어갑니다.

---

## 2. 백엔드(backend) .env 작성

`meet-middle/backend` 폴더에 `.env` 파일을 만들고 아래 변수들을 채웁니다.

### 2.1 필수 변수 (프로덕션에서도 동일)

```env
# 서버
NODE_ENV=development
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# DB (호스트/포트 방식 – 본인 DB 정보로 수정)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=비밀번호
DB_DATABASE=meet_middle
# 필요 시 (사용하지 않으면 public 스키마 사용 권장)
DB_SCHEMA=public
DB_SSL=false

# 카카오 (아래 3. 카카오 개발자 설정에서 발급 후 입력)
KAKAO_REST_KEY=발급받은_REST_API_키
KAKAO_CLIENT_ID=발급받은_REST_API_키_또는_Client_ID
KAKAO_CLIENT_SECRET=발급받은_Client_Secret

# JWT (32자 이상 랜덤 문자열 권장)
JWT_SECRET=여기에_32자_이상_랜덤_문자열_입력
```

### 2.2 선택 변수

```env
# JWT 만료 (없으면 기본값 사용)
# JWT_ACCESS_EXPIRES_IN=15m
# JWT_REFRESH_EXPIRES_IN=14d

# 로컬 DB만 쓰면 보통 false, 클라우드 DB는 true
# DB_SSL=false

# 프로덕션/Cross-Origin 쿠키용 (로컬은 보통 비움)
# COOKIE_DOMAIN=
# COOKIE_SAME_SITE=lax
# COOKIE_SECURE=false
```

### 2.3 JWT_SECRET 생성 예시

터미널에서:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

나온 128자 문자열을 `JWT_SECRET=` 뒤에 그대로 붙여넣으면 됩니다.

### 2.4 DB_URL 형식

이 프로젝트는 `.env`에서 `DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE` 형식으로 DB 연결 정보를 받습니다.

- 로컬 PostgreSQL 예시:
  - `DB_HOST=localhost`
  - `DB_PORT=5432`
  - `DB_USERNAME=postgres`
  - `DB_PASSWORD=비밀번호`
  - `DB_DATABASE=meet_middle`

`DB_SSL=true`는 Render/Neon 같은 클라우드 DB에서 보통 필요합니다.

---

## 3. 카카오 개발자에서 설정해야 할 부분

카카오 로그인 + 카카오맵(프론트)을 쓰므로 아래를 모두 설정해야 합니다.

### 3.1 접속

- [카카오 개발자 콘솔](https://developers.kakao.com/) 로그인  
- **내 애플리케이션** → 사용할 앱 선택 (없으면 새로 생성)

### 3.2 앱 키 확인 (백엔드 .env용)

- **앱 설정** → **앱 키**
  - **REST API 키**  
    → 백엔드 `.env`의 `KAKAO_REST_KEY`, `KAKAO_CLIENT_ID` 둘 다 이 값으로 넣어도 됩니다.  
    (OAuth용으로는 이 키를 Client ID로 사용합니다.)
- **제품 설정** → **카카오 로그인** → **보안**
  - **Client Secret** 사용 상태로 두고, **코드** 생성/확인  
  → 백엔드 `.env`의 `KAKAO_CLIENT_SECRET`에 입력

### 3.3 플랫폼 (Web) 등록

- **앱 설정** → **플랫폼** → **Web** 추가
- **사이트 도메인**에 다음 추가:
  - 로컬: `http://localhost:3000` (프론트), `http://localhost:3001` (백엔드)
  - 배포 시: `https://meet-middle-frontend.vercel.app`, 백엔드 URL 등 실제 도메인

### 3.4 Redirect URI (카카오 로그인 콜백)

- **제품 설정** → **카카오 로그인** → **Redirect URI**
- **Redirect URI 등록**에 **백엔드** 콜백 URL만 등록합니다 (프론트가 아님):
  - 로컬: `http://localhost:3001/api/auth/kakao/callback`
  - 프로덕션: `https://meet-middle-backend.onrender.com/api/auth/kakao/callback` (실제 백엔드 URL로 교체)

여기서 잘못되면 로그인 시 “Redirect URI 불일치” 오류가 납니다.

### 3.5 동의 항목

- **제품 설정** → **카카오 로그인** → **동의항목**
- **닉네임**, **프로필 사진** (필수)  
- **이메일** (선택)  
서비스에서 받고 싶은 항목만 켜두면 됩니다.

### 3.6 카카오맵 (프론트엔드용 JavaScript 키)

- **제품 설정** → **카카오맵** → 사용 설정
- **앱 키**에서 **JavaScript 키** 확인  
→ 이 값은 **프론트엔드** `.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_KEY`에 넣습니다 (아래 4장).

---

## 4. 프론트엔드(frontend) .env.local 작성

`meet-middle/frontend` 폴더에 `.env.local` 파일을 만들고 아래만 넣으면 됩니다.

### 4.1 필수 변수

```env
# 백엔드 API 주소 (로컬 개발 시)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# 카카오맵 JavaScript 키 (카카오 개발자 콘솔 → 카카오맵 → JavaScript 키)
NEXT_PUBLIC_KAKAO_MAP_KEY=발급받은_JavaScript_키
```

### 4.2 참고

- `NEXT_PUBLIC_` 접두사가 있어야 브라우저(클라이언트)에서 읽을 수 있습니다.
- 값을 바꾼 뒤에는 **프론트 서버를 한 번 재시작**하는 것이 안전합니다.
- 배포(Vercel 등) 시에는 해당 플랫폼의 환경 변수에 같은 이름으로 위 두 개를 설정하면 됩니다.
  - 로컬: `http://localhost:3001`
  - 배포: `https://meet-middle-backend.onrender.com` (실제 백엔드 URL로)

---

## 5. 실행 순서 요약

1. PostgreSQL 설치 후 DBeaver로 DB 생성 → `backend/database/final.sql` 전체 실행  
2. 백엔드: `.env` 작성 (DB_URL, 카카오 3종, JWT_SECRET 등)  
3. 카카오 개발자: Web 플랫폼, Redirect URI(백엔드 콜백), 동의항목, 카카오맵 JavaScript 키 확인  
4. 프론트엔드: `.env.local`에 `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_KAKAO_MAP_KEY` 작성  
5. 백엔드 실행: `npm run start:dev` (backend 폴더에서)  
6. 프론트엔드 실행: `npm run dev` (frontend 폴더에서)

이 순서대로 하면 PC 교체 후에도 동일하게 동작합니다.
