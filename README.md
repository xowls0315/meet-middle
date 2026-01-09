# 🗺️ Meet-Middle (약속 장소 중간지점 추천 서비스)

**2~4명의 출발지를 입력하면 최적의 만남 장소를 추천해드립니다**

- 🌐 **프론트엔드 URL (Vercel)**: https://meet-middle-frontend.vercel.app
- 🌐 **백엔드 URL (Render)**: https://meet-middle-backend.onrender.com
- 📚 **API 문서**: https://meet-middle-backend.onrender.com/api

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

### 6. 카카오 로그인

- OAuth 2.0 기반 소셜 로그인
- iOS Safari 호환 콜백 처리
- JWT 토큰 자동 갱신

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
# 개발 환경 (.env.development)
NODE_ENV=
PORT=3001

# 데이터베이스
DB_URL=postgresql://user:password@localhost:5432/meet_middle
DB_SSL=true

# 프론트엔드와 백엔드 서버
BACKEND_URL=
FRONTEND_URL=

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d

# 카카오 API
KAKAO_REST_KEY=your-kakao-rest-api-key
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=http://localhost:3001/auth/kakao/callback

# 쿠키
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=localhost
```

#### 데이터베이스 마이그레이션

```bash
npm run typeorm:run-migrations
```

#### 개발 서버 실행

```bash
npm run start:dev
```

백엔드 서버는 `http://localhost:3001`에서 실행됩니다.

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
   - Web 플랫폼 추가: `http://localhost:3000`
4. **카카오 로그인 설정**
   - Redirect URI: `http://localhost:3000/auth/kakao/callback`
5. **API 키 발급**
   - REST API 키
   - JavaScript 키
   - Client ID, Client Secret

---
## 05. 기타 📚

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
│   │   ├── auth/             # 인증 모듈
│   │   ├── search/           # 장소 검색 모듈
│   │   ├── recommend/        # 추천 로직 모듈
│   │   ├── share/            # 공유 모듈
│   │   ├── meetings/         # 기록 모듈
│   │   ├── favorites/        # 즐겨찾기 모듈
│   │   └── kakao-local/      # 카카오 API 래퍼
│   └── test/                 # 테스트 파일
│
└── README.md                 # 프로젝트 문서
```

### 🗄️ 데이터베이스 ERD

```
users (사용자)
├── id (PK, UUID)
├── kakaoId (UNIQUE)
├── nickname
├── profileImage
├── email
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

**문제**: Next.js 빌드 시 `useSearchParams()` Suspense 경계 필요 에러  
**해결**:

- 콜백 페이지를 Suspense로 감싸기
- `export const dynamic = "force-dynamic"` 설정

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

