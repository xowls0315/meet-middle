# 🗺️ Meet-Middle (약속 장소 중간지점 추천 서비스)

**2~4명의 출발지를 입력하면 최적의 만남 장소를 추천해드립니다**

- 🌐 **프론트엔드 URL (Vercel)**: https://meet-middle-frontend.vercel.app
- 🌐 **백엔드 URL (Render)**: https://meet-middle-backend-pdur.onrender.com
- 📚 **API 문서 (Swagger)**: https://meet-middle-backend-pdur.onrender.com/api-docs

---

## 01. 프로젝트 소개 📋

### 한 줄 요약

친구들과 만날 때 출발지만 입력하면, 중간지점 근처의 최적 랜드마크(지하철역, 문화시설, 공공기관 등)를 자동으로 추천해주는 웹 서비스입니다.

### 프로젝트의 목적 및 개요

모임 장소를 정할 때 "어디서 만나지?"라는 고민을 해결하기 위해 개발된 서비스입니다.
사용자가 각자의 출발지를 입력하면, 자동으로 중간지점(anchor)을 계산하고 그 근처의 랜드마크를 찾아 추천합니다.

### 해결하고자 하는 문제

- 👥 **2~4명이 만날 때** 최적의 중간지점 찾기
- 🚇 **대중교통 접근성이 좋은** 랜드마크 자동 검색
- 📍 **복잡한 계산 없이** 클릭 몇 번으로 장소 추천 받기
- 🔗 **추천 결과를 쉽게 공유**하고 기록 관리

### 주요 특징 및 장점

- ✨ **무료 운영**: 카카오 API 쿼터 절약을 위한 캐싱 및 Rate Limit 최적화
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크탑 모든 환경 지원
- 🔐 **게스트/로그인 모드**: 로그인 없이도 사용 가능, 로그인 시 기록 저장
- 🗺️ **실시간 지도 표시**: 카카오맵 연동으로 시각적으로 확인
- 🔄 **스마트 폴백**: 지하철역 → 문화시설 → 공공기관 → 관광명소 순으로 자동 검색
- 📤 **간편한 공유**: 링크 생성 및 모바일 Web Share API 지원

---

## 02. 프로젝트 주요 기능 🎯

### 1. 출발지 입력 및 자동완성

- 2~4명의 출발지를 장소명으로 입력
- 카카오 로컬 API를 활용한 실시간 자동완성
- 디바운싱 적용으로 API 호출 최적화

### 2. 중간지점 계산 및 랜드마크 추천

- 입력된 출발지들의 평균 좌표(anchor) 자동 계산
- anchor 기준으로 랜드마크 검색 (우선순위: 지하철역 → 문화시설 → 공공기관 → 관광명소)
- 반경 확대 검색 (2000m → 5000m → 10000m → 20000m)

### 3. 결과 시각화

- 카카오맵에 참가자 위치, 중간지점, 추천 장소 마커 표시
- 최종 추천 장소 및 후보 리스트 제공
- 카카오맵 앱 연동 (모바일)

### 4. 공유 기능

- 게스트/로그인 사용자 모두 사용 가능
- 공유 링크 생성 및 클립보드 복사
- 모바일 Web Share API 지원

### 5. 기록 관리 (로그인 사용자)

- 추천 결과 저장 및 조회
- 즐겨찾기 기능
- 참가자별 장소 정보 포함

### 6. 인증 (카카오 + 로컬)

- **카카오 로그인**: OAuth 2.0 기반 소셜 로그인, iOS Safari 호환 콜백 처리
- **로컬 로그인**: ID/비밀번호 회원가입·로그인, ID 찾기, 비밀번호 재설정
- JWT 토큰 자동 갱신 (Access/Refresh)

---

## 03. 프로젝트 기술 스택 🛠️

### 프론트엔드

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios 1.13.2
- **Icons**: React Icons 5.5.0
- **Map**: Kakao Map JavaScript SDK
- **배포**: Vercel

### 백엔드

- **Framework**: NestJS 10.4.0
- **Language**: TypeScript 5.7.3
- **Database**: PostgreSQL (TypeORM 0.3.20)
- **Authentication**: Passport (JWT, Kakao OAuth)
- **API Documentation**: Swagger
- **Rate Limiting**: @nestjs/throttler 5.1.1
- **Caching**: @nestjs/cache-manager 2.1.1
- **Validation**: class-validator, class-transformer
- **배포**: Render

### 외부 API

- **Kakao Local API**: 장소 검색 및 자동완성
- **Kakao OAuth 2.0**: 소셜 로그인

### 개발 도구

- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier

---

## 04. 프로젝트 설치 방법 📦

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- PostgreSQL 데이터베이스 (로컬 또는 클라우드)
- 카카오 개발자 계정 및 API 키

### 1. 저장소 클론

```bash
git clone <repository-url>
cd meet-middle
```

### 2. 백엔드 설정

```bash
cd backend
npm install
```

#### 환경 변수 설정 (`backend/.env`)

```env
# 개발 환경
NODE_ENV=development
PORT=3001

# 데이터베이스 (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=meet_middle
# 로컬 단일 스키마: public | Supabase 등 사용 시: meet-middle (final.sql과 동일)
DB_SCHEMA=public
DB_SSL=false

# 프론트엔드와 백엔드 서버
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# JWT (32자 이상 권장)
JWT_SECRET=your-jwt-secret-key-at-least-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d

# 카카오 API
KAKAO_REST_KEY=your-kakao-rest-api-key
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# 쿠키 (로컬 개발 시)
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=localhost
```

카카오 로그인 콜백은 백엔드 URL로 등록합니다. (`BACKEND_URL` + `/api/auth/kakao/callback`)

#### 데이터베이스 초기 설정

PostgreSQL에 연결 후 `backend/database/final.sql`을 실행하여 테이블을 생성합니다.

- **Supabase / `meet-middle` 스키마 사용**: `final.sql`을 그대로 실행한 뒤, `.env`에 `DB_SCHEMA=meet-middle`로 설정합니다.
- **로컬 단일 스키마 사용**: `final.sql` 상단의 `CREATE SCHEMA`, `SET search_path` 두 줄을 주석 처리한 뒤 실행하고, `.env`는 `DB_SCHEMA=public`로 둡니다.

#### 개발 서버 실행

```bash
npm run start:dev
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.  
API 문서(Swagger UI)는 `http://localhost:3001/api-docs`에서 확인할 수 있습니다.

### 3. 프론트엔드 설정

```bash
cd frontend
npm install
```

#### 환경 변수 설정 (`frontend/.env.local`)

```env
# 백엔드 URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# 카카오맵 API 키
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-map-javascript-key
```

#### 개발 서버 실행

```bash
npm run dev
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

### 4. 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. **플랫폼 설정**
   - Web 플랫폼 추가: `http://localhost:3000` (로컬), 배포 시 프론트엔드 URL 추가
4. **카카오 로그인 설정**
   - Redirect URI: **백엔드** 콜백 URL 등록
     - 로컬: `http://localhost:3001/api/auth/kakao/callback`
     - 배포: `https://meet-middle-backend-pdur.onrender.com/api/auth/kakao/callback`
5. **API 키 발급**
   - REST API 키 (KAKAO_REST_KEY, KAKAO_CLIENT_ID)
   - JavaScript 키 (프론트엔드 카카오맵용)
   - Client Secret (KAKAO_CLIENT_SECRET)

---

## 05. 기타 📚

### 📌 참고 문서

- **Supabase + UptimeRobot 설정**: [SUPABASE_UPTIMEROBOT_SETUP.md](./SUPABASE_UPTIMEROBOT_SETUP.md) — DB(Supabase) 및 무료 서버 웨이크업 설정 가이드

### ⏱️ Uptime Monitoring (Render sleep 방지)

- **UptimeRobot**으로 백엔드 URL을 **5분 간격**으로 핑(ping)하여 **Render 무료 플랜의 15분 sleep**을 방지합니다.
- Render Web Service는 15분간 요청이 없으면 슬립 모드로 전환되며, 첫 요청 시 콜드 스타트로 응답이 지연됩니다. 5분마다 헬스 체크(`GET /` 또는 `GET /health`)를 보내면 서버가 깨어 있는 상태를 유지할 수 있습니다.
- UptimeRobot 무료 플랜으로 모니터를 등록하고, **Monitor interval**을 **5 minutes**로 설정한 뒤 백엔드 URL(예: `https://meet-middle-backend-pdur.onrender.com`)을 감시 대상으로 추가하면 됩니다.
- 상세 설정(Supabase DB 연동 포함)은 [SUPABASE_UPTIMEROBOT_SETUP.md](./SUPABASE_UPTIMEROBOT_SETUP.md)를 참고하세요.

### 📁 프로젝트 구조

```
meet-middle/
├── frontend/                 # Next.js 프론트엔드
│   ├── app/                  # App Router 페이지
│   │   ├── page.tsx          # 메인 페이지
│   │   ├── auth/             # 인증 관련
│   │   ├── history/          # 기록 페이지
│   │   ├── favorites/        # 즐겨찾기 페이지
│   │   └── share/            # 공유 페이지
│   ├── _components/          # 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   └── ui/               # UI 컴포넌트
│   ├── lib/                  # 라이브러리
│   │   └── api/              # API 클라이언트
│   ├── hooks/                # 커스텀 훅
│   ├── types/                # TypeScript 타입
│   ├── utils/                # 유틸리티 함수
│   └── styles/               # 전역 스타일
│
├── backend/                  # NestJS 백엔드
│   ├── src/
│   │   ├── auth/             # 인증 모듈 (카카오 OAuth, 로컬 회원가입/로그인)
│   │   ├── search/           # 장소 검색 모듈
│   │   ├── recommend/        # 추천 로직 모듈
│   │   ├── share/            # 공유 모듈
│   │   ├── meetings/         # 기록 모듈
│   │   ├── favorites/        # 즐겨찾기 모듈
│   │   └── kakao-local/      # 카카오 API 래퍼
│   ├── database/             # DB 스키마 (final.sql)
│   └── test/                 # 테스트 파일
│
└── README.md                 # 프로젝트 문서
```

### 🗄️ 데이터베이스 ERD

```
users (사용자)
├── id (PK, UUID)
├── kakaoId (UNIQUE, nullable)
├── username (UNIQUE, nullable)
├── nickname
├── profileImage
├── email
├── passwordHash (nullable, 로컬 회원가입용)
├── refreshToken
├── createdAt
└── updatedAt

shares (공유 링크)
├── id (PK, UUID)
├── shareId (UNIQUE)
├── data (JSONB)
├── createdAt
└── expiresAt

meetings (기록)
├── id (PK, UUID)
├── userId (FK → users.id)
├── data (JSONB)
└── createdAt

favorites (즐겨찾기)
├── id (PK, UUID)
├── userId (FK → users.id)
├── placeId
├── name
├── address
├── lat
├── lng
├── placeUrl
├── createdAt
└── UNIQUE (userId, placeId)
```

**관계**:

- `users` : `meetings` = 1 : N
- `users` : `favorites` = 1 : N
- `shares` : 독립적 (게스트/로그인 사용자 모두 사용 가능)

### 🔧 프로젝트 과정 중 발생한 트러블슈팅

#### 1. 모바일 쿠키 문제

**문제**: iOS Safari에서 쿠키가 제대로 저장되지 않아 로그인이 실패하는 문제  
**해결**:

- `withCredentials: true` 설정
- 로그인 콜백 시 쿠키 반영 대기 로직 추가 (재시도 최대 3회)
- iOS OAuth 콜백을 프론트엔드에서 처리하도록 변경

**참고 문서**: `backend/FRONTEND_IOS_OAUTH_CALLBACK_GUIDE.md`

#### 2. 429 Too Many Requests 에러

**문제**: 버튼 연속 클릭 시 API 호출 제한으로 에러 발생  
**해결**:

- Exponential Backoff 재시도 로직 구현
- 버튼 로딩 상태 및 중복 클릭 방지
- 인증 엔드포인트의 429 에러는 조용히 처리

**참고 문서**: `backend/FRONTEND_MOBILE_CLIPBOARD_FIX.md`

#### 3. 모바일 클립보드 복사 에러

**문제**: 모바일에서 `navigator.clipboard.writeText()` 권한 에러 발생  
**해결**:

- Web Share API 우선 사용
- 클립보드 API fallback
- 최종 fallback으로 `prompt()` 사용

**참고 문서**: `backend/FRONTEND_MOBILE_CLIPBOARD_FIX.md`

#### 4. 카카오맵 링크 모바일 호환성

**문제**: 모바일에서 카카오맵 URL이 제대로 열리지 않음  
**해결**:

- 모바일/데스크탑 감지 로직 추가
- 모바일: `map.kakao.com/link/map/{이름},{lat},{lng}` 형식 사용
- 데스크탑: `map.kakao.com/link/search/{이름}` 형식 사용

#### 5. Access Token 자동 갱신

**문제**: Access Token 만료 시 사용자가 재로그인해야 함  
**해결**:

- 401 에러 발생 시 Refresh Token으로 자동 갱신
- 응답 헤더(`x-new-access-token`)에서 새 토큰 추출
- 원래 요청 자동 재시도

**참고 문서**: `backend/FRONTEND_TOKEN_AUTO_REFRESH_GUIDE.md`

#### 6. Vercel 배포 시 useSearchParams 에러

**문제**: Next.js 14+ 빌드 시 `useSearchParams() should be wrapped in a suspense boundary` 에러 (404, /, /favorites, /history 등)  
**해결**:

- `useSearchParams()`를 사용하는 컴포넌트(또는 그 훅을 쓰는 페이지)를 `<Suspense>`로 감싸기
- 루트 레이아웃의 Header, 메인/즐겨찾기/기록 페이지를 각각 Suspense로 감싼 구조로 수정
- 카카오 콜백 페이지: `export const dynamic = "force-dynamic"` 및 내부 콘텐츠를 Suspense로 감싸기

#### 7. 일반 계정 로그인 후 "이번 결과 저장"·"즐겨찾기 추가" 미동작

**문제**: 로컬(ID/PW) 로그인 후 메인에서 "이번 결과 저장", "즐겨찾기 추가" 클릭 시 "로그인 후 사용 가능합니다" 알림만 뜨는 현상  
**원인**:

- 카카오 로그인은 리다이렉트 후 `?login=success`로 `loadUser()`가 다시 호출되어 `isLoggedIn`·`user` 상태가 갱신됨
- 로컬 로그인은 `loginWithCredentials()`가 **메모리의 accessToken만 설정**하고, `useAuth`의 React 상태는 그대로라 UI가 비로그인으로 남음

**해결**:

- `Header`에서 로컬 로그인·회원가입 성공 직후 `reloadUser()`를 호출하여 `loadSession(force)`로 사용자 정보를 즉시 반영
- `loadSession()`은 전역 캐시·in-flight dedupe를 사용하므로 Header·메인 페이지 등 여러 `useAuth()` 인스턴스가 동일한 세션을 공유
- (이후 429 이슈 대응으로) pathname 변경마다 `loadUser()`를 호출하던 방식은 제거하고, 로컬 로그인 시에는 `reloadUser()` 명시 호출만 사용 (→ 10번 항목 참고)

**관련 파일**: `frontend/_components/layout/Header.tsx`, `frontend/hooks/useAuth.ts`, `frontend/lib/api/auth.ts`

#### 8. Kakao Local API 403 에러

**문제**: 장소 자동완성(`/api/search/suggest`) 호출 시 Kakao Local API에서 `403 Forbidden` 에러가 발생해 검색 결과가 표시되지 않는 문제  
**해결**:

- 카카오 개발자 콘솔에서 **로컬(Local) API 사용 권한**이 비활성화되어 있거나, 잘못된 앱 키를 사용하는 경우 발생
- 백엔드 `.env`에서 `KAKAO_REST_KEY`에 **REST API 키**를 정확히 설정하고, 해당 키에 로컬 API 권한이 활성화되어 있는지 확인
- (테스트 환경) 도메인 제한이 있는 경우, 콘솔의 **플랫폼 → Web** 항목에 `http://localhost:3001` 또는 실제 백엔드 도메인을 등록

#### 9. 카카오 로그인 Redirect URI 불일치 (KOE303)

**문제**: 카카오 로그인 콜백에서 `{"error":"invalid_grant","error_description":"Redirect URI mismatch.","error_code":"KOE303"}` 에러가 발생하며 로그인이 실패하는 문제  
**해결**:

- 백엔드에서 카카오 토큰 요청 시 사용하는 콜백 URL은 `BACKEND_URL + "/api/auth/kakao/callback"` 형식으로 고정
- 카카오 개발자 콘솔의 **카카오 로그인 → Redirect URI** 목록에, 아래 두 가지를 실제로 사용하는 값과 **완전히 동일하게** 등록
  - 개발: `http://localhost:3001/api/auth/kakao/callback`
  - 배포: `https://meet-middle-backend-pdur.onrender.com/api/auth/kakao/callback`
- `.env` / Render 환경변수에서 `BACKEND_URL`과 `KAKAO_CLIENT_ID`가 올바른 프로젝트를 가리키는지 확인

#### 10. 로그인 시 `/api/auth/token` 429 Too Many Requests 에러

**문제**: 배포 환경(Vercel → Render)에서 로그인할 때마다 `GET /api/auth/token` 요청이 `429 Too Many Requests`로 실패하는 문제가 자주 발생  
**원인**:

- 백엔드 전역 `ThrottlerGuard`의 `medium` 규칙(분당 10회)이 인증 API에도 적용되어, 짧은 시간에 여러 요청이 몰리면 한도를 초과
- 프론트엔드에서 `Header`, 메인 페이지 등 여러 컴포넌트가 각각 `useAuth()`를 호출하며 `/api/auth/token`을 **중복 요청**
- (이전) pathname 변경 시마다 `loadUser()`가 재호출되어 페이지 이동·로그인 직후 요청이 더욱 증가

**해결**:

- **백엔드**: `app.module.ts`에 인증 전용 `auth` throttler(분당 120회) 추가, `auth.controller.ts`의 `token` / `me` / `refresh` 엔드포인트에 `@SkipThrottle({ short, medium })` + `@Throttle({ auth })` 적용
- **프론트엔드**: `lib/api/auth.ts`에 `getAccessTokenFromServer()` in-flight dedupe 및 `loadSession()` 전역 세션 로드(캐시 포함) 추가로 중복 호출 방지
- **프론트엔드**: `useAuth` 훅에서 pathname 변경 시 `loadUser()` 재호출 로직 제거, 로컬 로그인 후에는 `reloadUser()`로 세션 갱신
- 429 응답은 `SilentRateLimitError`로 조용히 처리하여 콘솔 에러 스팸 방지

**관련 파일**: `backend/src/app.module.ts`, `backend/src/auth/auth.controller.ts`, `frontend/lib/api/auth.ts`, `frontend/hooks/useAuth.ts`

### 💭 프로젝트 후기

#### 성과

- ✅ **무료 운영 목표 달성**: 캐싱 및 Rate Limit을 통해 카카오 API 쿼터를 효율적으로 관리
- ✅ **반응형 디자인 완성**: 모바일부터 데스크탑까지 모든 환경에서 사용 가능
- ✅ **사용자 경험 개선**: 자동완성, 지도 시각화, 공유 기능 등 편의성 향상
- ✅ **안정적인 인증 시스템**: JWT 토큰 자동 갱신 및 iOS 호환성 확보

#### 어려웠던 점

- **모바일 환경 대응**: iOS Safari의 쿠키 및 권한 정책으로 인한 추가 개발 시간 소요
- **API 쿼터 관리**: 무료 운영을 위한 최적화와 사용자 경험의 균형점 찾기
- **복잡한 추천 로직**: 여러 카테고리와 반경을 순차적으로 검색하는 폴백 로직 구현

#### 개선하고 싶은 부분

- 📊 **추천 알고리즘 고도화**: 사용자별 선호도, 대중교통 접근성 가중치 추가
- 🔍 **검색 결과 필터링**: 카테고리별 필터, 거리순 정렬 등 옵션 추가
- 📈 **통계 및 분석**: 인기 장소, 사용자 패턴 분석 기능
- 🌍 **지역 확대**: 더 넓은 지역 지원 및 해외 도시 지원

---

## 06. 실행 화면 🖼️

<table>
  <tr>
    <th style="text-align:center;">메인 화면 (Web)</th>
    <th style="text-align:center;">장소 추천받기 이후 화면 (Web)</th>
  </tr>
  <tr>
    <td align="center">
      <div style="background-color:#f5f5f5; padding:10px; border-radius:12px; display:inline-block;">
        <img width="1527" height="784" alt="image" src="https://github.com/user-attachments/assets/441b0c02-be62-4469-b15f-511d75f036bd" />
      </div>
    </td>
    <td align="center">
      <div style="background-color:#f5f5f5; padding:10px; border-radius:12px; display:inline-block;">
        <img width="1230" height="898" alt="image" src="https://github.com/user-attachments/assets/3c66c599-9460-4a37-865c-c26fb8ffece3" />
      </div>
    </td>
  </tr>
</table>

<table>
  <tr>
    <th style="text-align:center;">메인 화면 (Mobile)</th>
    <th style="text-align:center;">장소 추천받기 이후 화면 (Mobile)</th>
  </tr>
  <tr>
    <td align="center">
      <div style="background-color:#f5f5f5; padding:10px; border-radius:12px; display:inline-block;">
        <img width="1170" height="2532" alt="image" src="https://github.com/user-attachments/assets/e7e99d35-abef-4e3a-bb42-5d52941b8e3b" />
      </div>
    </td>
    <td align="center">
      <div style="background-color:#f5f5f5; padding:10px; border-radius:12px; display:inline-block;">
        <img width="1170" height="2532" alt="image" src="https://github.com/user-attachments/assets/f2f309fc-df11-4d9e-8ee1-20165c6b4f7f" />
      </div>
    </td>
  </tr>
</table>

---

## 📄 라이선스

이 프로젝트는 팀 프로젝트입니다.

---

## 👤 개발자

팀 프로젝트로 개발되었습니다.

<table width="100%" style="border-collapse: collapse; text-align: center;">
<thead>
<tr>
<th>Name</th>
<td width="100" align="center">황태진</td>
<td width="100" align="center">박신율</td>  
</tr>
<tr>
<th>Position</th>
<td width="150" align="center">
Frontend<br>
DevOps<br>
</td>
<td width="150" align="center">
Backend<br>
</td>
</tr>
</thead>
</table>
