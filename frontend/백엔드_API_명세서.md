# 백엔드 API 명세서

## 📌 중요 사항

### 카카오맵 API 사용 구분

- **프론트엔드**: 카카오맵 JavaScript SDK (지도 표시용) - JS SDK 키 사용
- **백엔드**: 카카오 로컬 REST API (장소 검색, 자동완성 등) - REST API 키 사용

**백엔드는 카카오 로컬 REST API를 직접 호출하여 데이터를 가공하고, 프론트엔드는 백엔드 API를 통해 데이터를 받아옵니다.**

### 환경 변수

```
KAKAO_REST_KEY=카카오_로컬_REST_API_키
KAKAO_CLIENT_ID=카카오_OAuth_클라이언트_ID
KAKAO_CLIENT_SECRET=카카오_OAuth_클라이언트_시크릿
JWT_SECRET=JWT_토큰_시크릿
DB_URL=데이터베이스_URL
```

### CORS 설정

- 개발 환경: `http://localhost:3000`
- 프로덕션: 실제 도메인 추가

---

## 🚀 개발 순서 가이드

프론트엔드 개발 효율을 고려한 구현 우선순위입니다.

### ✅ 1단계: 필수 API (핵심 기능) - 최우선 구현

게스트 사용자도 사용할 수 있는 핵심 기능입니다. **이 단계를 먼저 구현하면 프론트엔드에서 자동완성과 추천 기능을 테스트할 수 있습니다.**

1. **`GET /api/search/suggest`** - 자동완성 ⭐ 가장 먼저 구현 권장
2. **`POST /api/recommend`** - 추천 받기 (핵심 기능)
3. **`GET /api/share/:id`** - 공유 페이지 조회
4. **`POST /api/share`** - 공유 링크 생성

### ✅ 2단계: 인증 API (로그인 기능)

로그인 기능 구현. 3단계 API를 사용하려면 필수입니다.

5. **`GET /api/auth/kakao`** - 로그인 시작
6. **`GET /api/auth/kakao/callback`** - 로그인 콜백
7. **`GET /api/me`** - 사용자 정보 조회

### ✅ 3단계: 저장 기능 API (로그인 후)

로그인한 사용자만 사용할 수 있는 기능입니다. 2단계(인증) 구현 후 진행하세요.

8. **`POST /api/meetings`** - 기록 저장
9. **`GET /api/meetings`** - 기록 조회
10. **`DELETE /api/meetings/:id`** - 기록 삭제
11. **`POST /api/favorites`** - 즐겨찾기 추가
12. **`GET /api/favorites`** - 즐겨찾기 조회
13. **`DELETE /api/favorites/:placeId`** - 즐겨찾기 삭제

---

## 📍 1단계: 필수 API (핵심 기능)

### 1. 자동완성 (장소 검색)

#### `GET /api/search/suggest`

**⭐ 최우선 구현 권장** - 프론트엔드에서 가장 먼저 사용하는 API입니다.

- **설명**: 장소 이름 자동완성 검색
- **인증**: 불필요 (게스트도 사용 가능)
- **카카오 API**: 키워드 검색 API 사용
- **Rate Limit**: IP당 분당 30회 (무료 운영 필수)
- **캐시**: 동일 쿼리는 60초 TTL (중요!)

**쿼리 파라미터:**

- `q` (필수): 검색어 (최소 2글자)
- `size` (선택): 반환 개수 (기본값: 7, 최대: 10)

**검증:**

- `q`가 2글자 미만이면 빈 배열 반환 (400 에러 아님)

**응답:**

```typescript
[
  {
    placeId: string;        // 카카오 place_id
    name: string;           // 장소명
    address: string;        // 전체 주소
    lat: number;           // 위도
    lng: number;           // 경도
    placeUrl?: string;     // 카카오맵 URL (선택)
  }
]
```

**에러:**

- 400: q가 2글자 미만 (또는 빈 배열 반환)
- 429: Rate limit 초과
- 500: 카카오 API 오류

**구현 팁:**

- 캐시 구현 필수! (Redis 또는 인메모리 캐시)
- 동일 쿼리는 60초 동안 캐시에서 반환
- Rate limit 가드 필수 (무료 운영 핵심)

---

### 2. 만남 장소 추천

#### `POST /api/recommend`

**핵심 기능** - 중간지점 추천 로직이 복잡합니다. 충분한 테스트가 필요합니다.

- **설명**: 중간지점 추천 (랜드마크 검색)
- **인증**: 불필요 (게스트도 사용 가능)
- **카카오 API**: 카테고리 검색 API 사용 (`sort=distance`)
- **Rate Limit**: IP당 분당 10회
- **캐시**: 5분 TTL (anchor+category+radius 기준)

**Request Body:**

```typescript
{
  participants: [
    {
      label: string;       // "A", "B", "C", "D" 중 하나 (필수)
      lat: number;        // 위도 (필수)
      lng: number;        // 경도 (필수)
    }
  ]
}
```

**검증:**

- participants 길이는 2~4
- label은 "A", "B", "C", "D" 중 하나
- lat: -90 ~ 90, lng: -180 ~ 180

**응답:**

```typescript
{
  anchor: {
    lat: number;          // 참가자들의 평균 좌표 (중심점)
    lng: number;
  },
  final: {                // 최종 추천 장소
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl: string;
    distance: number;     // anchor로부터의 거리 (미터)
  },
  candidates: [           // 후보 장소들 (최대 10개)
    {
      placeId: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      placeUrl: string;
      distance: number;
    }
  ],
  used: {
    category: string;     // "SW8" | "CT1" | "PO3" | "AT4"
    radius: number;       // 사용된 검색 반경 (미터)
  }
}
```

**랜드마크 검색 로직 (중요!):**

1. **anchor 좌표 계산**: participants의 평균 좌표 계산
2. **카테고리 순서대로 검색** (카카오 로컬 API - 카테고리 검색):
   - SW8 (지하철역) → 우선순위 1
   - CT1 (문화시설) → 우선순위 2
   - PO3 (공공기관) → 우선순위 3
   - AT4 (관광명소) → 우선순위 4
3. **반경 단계별 검색** (각 카테고리마다):
   - 2000m → 5000m → 10000m → 20000m
4. **첫 번째 성공한 결과**를 `final`로 설정
5. **같은 카테고리/반경**에서 상위 10개를 `candidates`로 설정
6. **사용된 카테고리/반경**을 `used`에 기록
7. **최대 시도 횟수**: 4카테고리 × 4반경 = 16회 (안전장치 필수!)

**에러:**

- 400: 잘못된 입력 (인원 수, 좌표 범위 등)
- 404: 추천 장소를 찾을 수 없음 (모든 시도 실패)
- 429: Rate limit 초과
- 500: 서버 오류

**구현 팁:**

- 루프 중 무한 호출 방지 필수 (최대 16회 제한)
- 캐시 구현으로 동일 anchor 좌표의 반복 호출 최소화
- 카카오 API 호출 실패 시 다음 카테고리/반경으로 진행

---

### 3. 공유 링크 조회

#### `GET /api/share/:id`

- **설명**: 공유된 추천 결과 조회
- **인증**: 불필요
- **Path Parameter**: `id` (shareId)

**응답:**

```typescript
{
  anchor: {
    lat: number;
    lng: number;
  },
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl: string;
    distance?: number;
  },
  candidates?: [
    {
      placeId: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      placeUrl: string;
      distance?: number;
    }
  ],
  participants?: [         // 라벨과 좌표만 (개인정보 최소화)
    {
      label: string;
      lat: number;
      lng: number;
    }
  ]
}
```

**에러:**

- 404: 공유 데이터를 찾을 수 없음 (만료 또는 존재하지 않음)

---

### 4. 공유 링크 생성

#### `POST /api/share`

- **설명**: 추천 결과 공유 링크 생성
- **인증**: 불필요 (게스트도 사용 가능)
- **Rate Limit**: IP당 분당 10회
- **참고**: 공유 데이터는 7일 후 자동 삭제 (무료 운영 최적화)

**Request Body:**

```typescript
{
  anchor: {
    lat: number;
    lng: number;
  },
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl: string;
    distance?: number;
  },
  candidates?: [           // 최대 10개
    {
      placeId: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      placeUrl: string;
      distance?: number;
    }
  ],
  participants: [          // 라벨과 좌표만 (개인정보 최소화)
    {
      label: string;       // "A", "B", "C", "D"
      lat: number;
      lng: number;
    }
  ]
}
```

**응답:**

```typescript
{
  shareId: string; // 공유 ID
  url: string; // 전체 공유 URL (예: https://domain.com/share/abc123)
}
```

**구현 팁:**

- shareId는 UUID 또는 랜덤 문자열 사용
- 개인정보 최소화: 참가자의 원문 주소나 이름은 저장하지 않음
- 7일 후 자동 삭제 스케줄러 구현 (또는 만료 시 삭제)

---

## 🔐 2단계: 인증 API (로그인 기능)

### 5. 카카오 로그인 시작

#### `GET /api/auth/kakao`

- **설명**: 카카오 로그인 리다이렉트 URL 생성
- **응답**: 카카오 OAuth 인증 페이지로 리다이렉트
- **참고**: 카카오 OAuth 2.0 표준 플로우 사용

**구현:**

1. 카카오 OAuth 인증 URL 생성
2. `redirect_uri`는 `/api/auth/kakao/callback`으로 설정
3. 카카오 인증 페이지로 리다이렉트

---

### 6. 카카오 로그인 콜백

#### `GET /api/auth/kakao/callback`

- **설명**: 카카오 OAuth 콜백 처리
- **쿼리 파라미터**: `code` (카카오에서 전달받은 인가 코드)

**처리 로직:**

1. `code`로 카카오 액세스 토큰 발급
2. 액세스 토큰으로 카카오 사용자 정보 조회
3. 사용자 정보를 DB에 저장/업데이트 (없으면 생성)
4. JWT 토큰 생성
5. httpOnly 쿠키에 JWT 토큰 설정
6. 프론트엔드로 리다이렉트 (예: `http://localhost:3000`)

**응답:**

- 성공: 프론트엔드로 리다이렉트
- 실패: 에러 페이지 또는 에러 메시지 반환

**참고:**

- JWT 토큰은 httpOnly 쿠키로 전달하는 것을 권장 (프론트엔드 단순화)
- 쿠키 도메인 설정 필요 (프론트엔드와 동일 도메인)

---

### 7. 사용자 정보 조회

#### `GET /api/me`

- **설명**: 현재 로그인한 사용자 정보 조회
- **인증**: 필요 (쿠키의 JWT 토큰)
- **Guard**: JWT 토큰 검증 필요

**응답:**

```typescript
{
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
}
```

**에러:**

- 401: 로그인되지 않음 (JWT 토큰 없음 또는 만료)

---

## 💾 3단계: 저장 기능 API (로그인 후)

### 8. 기록 저장

#### `POST /api/meetings`

- **설명**: 추천 결과를 기록으로 저장
- **인증**: 필요
- **Guard**: JWT 토큰 검증 필요

**Request Body:**

```typescript
{
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl: string;
    distance?: number;
  },
  participantCount: number;  // 2, 3, 4 중 하나
  // 참가자 원문 주소는 저장하지 않음 (개인정보 최소화)
}
```

**응답:**

```typescript
{
  id: string; // meeting ID
  createdAt: string; // ISO 8601 형식
}
```

---

### 9. 기록 목록 조회

#### `GET /api/meetings`

- **설명**: 저장된 기록 목록 조회 (최근순)
- **인증**: 필요
- **Guard**: JWT 토큰 검증 필요

**응답:**

```typescript
[
  {
    id: string;
    createdAt: string;    // ISO 8601 형식
    final: {
      placeId: string;
      name: string;
      address: string;
      lat: number;
      lng: number;
      placeUrl: string;
      distance?: number;
    },
    participantCount: number;
  }
]
```

**구현:**

- JWT 토큰에서 사용자 ID 추출
- 해당 사용자의 기록만 조회
- `createdAt` 기준 내림차순 정렬 (최근순)

---

### 10. 기록 삭제

#### `DELETE /api/meetings/:id`

- **설명**: 기록 삭제
- **인증**: 필요
- **Guard**: JWT 토큰 검증 + 소유자 확인 필요
- **Path Parameter**: `id` (meeting ID)

**응답:** 204 No Content

**에러:**

- 403: 다른 사용자의 기록 (권한 없음)
- 404: 기록을 찾을 수 없음

**구현:**

- JWT 토큰에서 사용자 ID 추출
- 기록 소유자 확인 후 삭제

---

### 11. 즐겨찾기 추가

#### `POST /api/favorites`

- **설명**: 장소를 즐겨찾기에 추가
- **인증**: 필요
- **Guard**: JWT 토큰 검증 필요
- **중복 방지**: `placeId` 기준 unique 제약 조건

**Request Body:**

```typescript
{
  placeId: string;        // 중복 방지용 (unique)
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
}
```

**응답:**

```typescript
{
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
}
```

**에러:**

- 409: 이미 즐겨찾기에 있는 장소 (중복)

**구현:**

- DB에 `(userId, placeId)` unique 인덱스 생성 권장

---

### 12. 즐겨찾기 목록 조회

#### `GET /api/favorites`

- **설명**: 즐겨찾기 목록 조회
- **인증**: 필요
- **Guard**: JWT 토큰 검증 필요

**응답:**

```typescript
[
  {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl?: string;
  }
]
```

**구현:**

- JWT 토큰에서 사용자 ID 추출
- 해당 사용자의 즐겨찾기만 조회

---

### 13. 즐겨찾기 삭제

#### `DELETE /api/favorites/:placeId`

- **설명**: 즐겨찾기에서 제거
- **인증**: 필요
- **Guard**: JWT 토큰 검증 필요
- **Path Parameter**: `placeId` (place ID)

**응답:** 204 No Content

**에러:**

- 404: 즐겨찾기를 찾을 수 없음

---

## 🔧 공통 사항

### 에러 응답 형식

모든 에러는 다음 형식으로 반환:

```typescript
{
  error: string;          // 에러 메시지
  code?: string;          // 에러 코드 (선택)
}
```

### HTTP 상태 코드

- `200`: 성공
- `201`: 생성 성공
- `204`: 삭제 성공 (내용 없음)
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `409`: 충돌 (중복 등)
- `429`: Rate limit 초과
- `500`: 서버 오류

### Rate Limit (무료 운영 핵심!)

**필수 구현** - 카카오 API 무료 플랜 한도 관리:

- `/api/search/suggest`: IP당 분당 30회
- `/api/recommend`: IP당 분당 10회
- `/api/share`: IP당 분당 10회
- 나머지: 적절히 설정

**구현 방법:**

- Redis 또는 인메모리 카운터 사용
- IP 기반으로 요청 횟수 추적
- 429 에러 반환 시 재시도 가이드 메시지 포함

### 캐시 전략 (무료 운영 핵심!)

**필수 구현** - 불필요한 카카오 API 호출 방지:

- `/api/search/suggest`: 60초 TTL (동일 쿼리)
- `/api/recommend`: 5분 TTL (anchor+category+radius 기준)

**구현 방법:**

- Redis 권장 (분산 환경 대응)
- 인메모리 캐시도 가능 (단일 서버)
- 캐시 키 설계:
  - suggest: `suggest:{query}`
  - recommend: `recommend:{anchorLat}:{anchorLng}:{category}:{radius}`

### 데이터베이스 스키마 (참고)

**Meetings 테이블:**

```
id (PK)
userId (FK, 인덱스)
final (JSON)
participantCount
createdAt
```

**Favorites 테이블:**

```
userId (FK)
placeId
name
address
lat
lng
placeUrl
createdAt
UNIQUE(userId, placeId)
```

**Shares 테이블:**

```
id (PK)
anchor (JSON)
final (JSON)
candidates (JSON)
participants (JSON)
expiresAt (7일 후)
createdAt
```

---

## 📝 참고사항

### 1. 무료 운영 최적화 (필수!)

- **Rate limit 필수**: 카카오 API 무료 플랜 한도 관리
- **캐시 적극 활용**: 동일 요청 반복 호출 방지
- **불필요한 호출 방지**: 검증 로직으로 잘못된 요청 차단

### 2. 개인정보 보호

- 공유/기록 시 참가자 원문 주소 저장하지 않음
- 라벨과 좌표만 저장
- 공유 데이터 7일 후 자동 삭제

### 3. 타입 일치

- 프론트엔드 타입 정의와 1:1 매칭 필요
- `Place` 인터페이스 구조 유지
- 응답 형식 변경 시 프론트엔드와 협의 필요

### 4. 카카오 로컬 API 사용

- **자동완성**: 키워드 검색 API (`/v2/local/search/keyword.json`)
- **추천**: 카테고리 검색 API (`/v2/local/search/category.json`, `sort=distance`)

### 5. 개발 팁

- 1단계 API 먼저 구현 → 프론트엔드와 통합 테스트
- 캐시와 Rate Limit은 처음부터 구현 권장
- 에러 처리 철저히 (카카오 API 오류 대응)
- 로깅 필수 (외부 호출 횟수, 폴백 사용률, 429 발생 등)

---

## 📞 문의

API 구현 중 문의사항이 있으면 프론트엔드 개발자와 협의하세요.
