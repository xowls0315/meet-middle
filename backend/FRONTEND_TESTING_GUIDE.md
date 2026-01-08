# 프론트엔드 개발자를 위한 백엔드 API 테스트 가이드

## 📚 목차

1. [Swagger UI 사용법](#swagger-ui-사용법)
2. [API 엔드포인트 목록](#api-엔드포인트-목록)
3. [인증 방법](#인증-방법)
4. [요청/응답 예시](#요청응답-예시)
5. [에러 처리](#에러-처리)
6. [테스트 시나리오](#테스트-시나리오)

---

## 🌐 Swagger UI 사용법

### 접속 방법

**로컬 개발 환경:**
```
http://localhost:3001/api-docs
```

**프로덕션 환경 (Render 배포 후):**
```
https://your-backend-service.onrender.com/api-docs
```

⚠️ **중요**: 
- 프로덕션 URL은 백엔드 개발자로부터 받은 실제 Render 배포 URL을 사용하세요.
- Swagger UI에서 **서버 선택** 드롭다운에서 프로덕션 서버를 선택하면 모든 API 요청이 프로덕션 서버로 전송됩니다.

### Swagger UI 기능

1. **API 탐색**: 모든 엔드포인트를 카테고리별로 확인
2. **요청 테스트**: 직접 API 호출 및 응답 확인
3. **인증 설정**: JWT 토큰 설정으로 인증 필요한 API 테스트
4. **스키마 확인**: 요청/응답 형식 확인

### 인증 설정 (Swagger UI)

#### 방법 1: JWT-auth (Bearer Token) - 권장 ⭐

⚠️ **중요**: JWT-auth에는 **토큰 값만** 입력하세요! `Bearer` 접두사를 포함하면 안 됩니다!

1. Swagger UI 상단의 **Authorize** 버튼 클릭
2. **JWT-auth** 섹션의 "Enter JWT token" 필드에 **토큰 값만** 입력:
   - ✅ **올바른 입력**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (토큰만)
   - ❌ **잘못된 입력**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Bearer 포함 시 `Bearer Bearer`가 되어 인증 실패!)
3. **Authorize** 클릭
4. 이후 모든 인증 필요한 API에 자동으로 토큰 포함

**💡 참고**: Swagger UI가 자동으로 `Bearer` 접두사를 추가하므로, 사용자는 토큰 값만 입력하면 됩니다.

#### 방법 2: Cookie 인증

**Cookie 인증 사용 시나리오:**
- 카카오 로그인 후 브라우저에 `access_token` 쿠키가 자동으로 설정된 경우
- 또는 JWT-auth에서 받은 토큰을 Cookie로도 사용하고 싶은 경우

**설정 방법:**
1. Swagger UI 상단의 **Authorize** 버튼 클릭
2. **cookie (apiKey)** 섹션에서:
   - **Value** 필드에 **JWT 토큰 값만** 입력 (Bearer 제외)
   - 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - ⚠️ **주의**: `Bearer` 접두사는 입력하지 않습니다!
3. **Authorize** 클릭

**토큰 얻는 방법:**
- **방법 A**: 카카오 로그인 후 브라우저 개발자 도구 → Application → Cookies → `access_token` 값 복사
- **방법 B**: JWT-auth에 입력한 토큰 값 그대로 사용 (Bearer 제외)

**💡 권장사항:**
- 일반적으로 **JWT-auth (Bearer Token)** 방식이 더 간단하고 권장됩니다.
- Cookie 인증은 브라우저에서 자동으로 쿠키가 전송되므로, 별도 설정 없이도 작동할 수 있습니다.

---

## 🌐 프로덕션 서버 접속

### Render 배포 서버 정보

백엔드 개발자로부터 다음 정보를 받으세요:
- **Render 배포 URL**: `https://your-backend-service.onrender.com`
- **Swagger UI URL**: `https://your-backend-service.onrender.com/api-docs`

### Swagger UI에서 서버 전환

1. Swagger UI 접속
2. 상단의 **서버 선택** 드롭다운 클릭
3. **프로덕션 서버 (Render)** 선택
4. 모든 API 요청이 프로덕션 서버로 전송됩니다

### 헬스 체크

배포 서버가 정상 작동하는지 확인:
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

---

## 📋 API 엔드포인트 목록

### 1. 인증 (Auth)

#### 1.1 카카오 로그인 시작
```
GET /api/auth/kakao
```
- **인증**: 불필요
- **설명**: 카카오 로그인 페이지로 리다이렉트
- **테스트**: 브라우저에서 직접 접속

#### 1.2 현재 사용자 정보 조회
```
GET /api/auth/me
```
- **인증**: 필요 (JWT)
- **응답**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "홍길동",
  "email": "hong@example.com",
  "profileImage": "https://k.kakaocdn.net/..."
}
```

#### 1.3 Access Token 갱신
```
POST /api/auth/refresh
```
- **인증**: 불필요 (Refresh Token 쿠키 필요)
- **응답**:
```json
{
  "success": true
}
```

#### 1.4 로그아웃
```
POST /api/auth/logout
```
- **인증**: 필요 (JWT)
- **설명**: 로그아웃 후 카카오 로그아웃 URL로 리다이렉트됩니다. 카카오 세션도 함께 종료됩니다.
- **⚠️ 주의**: 
  - Swagger UI에서 테스트 시 "Failed to fetch" 에러가 표시될 수 있지만, 실제로는 정상 작동합니다 (카카오로 리다이렉트되기 때문).
  - 브라우저에서 직접 테스트하거나 Postman을 사용하세요.
- **응답**: 리다이렉트 (302) → 카카오 로그아웃 페이지 → 프론트엔드로 리다이렉트

---

### 2. 검색 (Search)

#### 2.1 장소 자동완성
```
GET /api/search/suggest?q=강남역
```
- **인증**: 불필요
- **쿼리 파라미터**:
  - `q`: 검색 키워드 (최소 2자)
- **응답**:
```json
[
  {
    "placeId": "8241891",
    "name": "강남역",
    "address": "서울특별시 강남구 강남대로 396",
    "lat": 37.4981,
    "lng": 127.0276,
    "placeUrl": "http://place.map.kakao.com/m/8241891"
  }
]
```

---

### 3. 추천 (Recommend)

#### 3.1 중간 지점 추천
```
POST /api/recommend
```
- **인증**: 불필요
- **요청 본문**:
```json
{
  "participants": [
    {
      "label": "A",
      "lat": 37.5665,
      "lng": 126.9780
    },
    {
      "label": "B",
      "lat": 37.5651,
      "lng": 126.9895
    }
  ]
}
```
- **응답**:
```json
{
  "anchor": {
    "lat": 37.5658,
    "lng": 126.9837
  },
  "final": {
    "placeId": "8241891",
    "name": "강남역",
    "address": "서울특별시 강남구 강남대로 396",
    "lat": 37.4981,
    "lng": 127.0276,
    "placeUrl": "http://place.map.kakao.com/m/8241891",
    "distance": 500
  },
  "candidates": [
    {
      "placeId": "8241891",
      "name": "강남역",
      "address": "서울특별시 강남구 강남대로 396",
      "lat": 37.4981,
      "lng": 127.0276,
      "placeUrl": "http://place.map.kakao.com/m/8241891",
      "distance": 500
    }
  ],
  "used": {
    "category": "SW8",
    "radius": 2000
  }
}
```

---

### 4. 공유 (Share)

#### 4.1 공유 링크 생성
```
POST /api/share
```
- **인증**: 불필요
- **요청 본문**: (Swagger UI에서 예시 확인)
- **응답**:
```json
{
  "shareId": "23f5b2bd-df9c-4315-9e84-09198d3cc3a0",
  "url": "http://localhost:3000/share/23f5b2bd-df9c-4315-9e84-09198d3cc3a0"
}
```

#### 4.2 공유 링크 조회
```
GET /api/share/{shareId}
```
- **인증**: 불필요
- **경로 파라미터**:
  - `shareId`: 공유 링크 ID (UUID)
- **응답**: (Swagger UI에서 예시 확인)

---

### 5. 약속 기록 (Meetings)

#### 5.1 약속 기록 생성
```
POST /api/meetings
```
- **인증**: 필요 (JWT)
- **요청 본문**:
```json
{
  "final": {
    "placeId": "8241891",
    "name": "강남역",
    "address": "서울특별시 강남구 강남대로 396",
    "lat": 37.4981,
    "lng": 127.0276,
    "placeUrl": "http://place.map.kakao.com/m/8241891",
    "distance": 500
  },
  "participantCount": 2
}
```

#### 5.2 약속 기록 목록 조회
```
GET /api/meetings
```
- **인증**: 필요 (JWT)
- **응답**: 약속 기록 배열

#### 5.3 약속 기록 삭제
```
DELETE /api/meetings/{id}
```
- **인증**: 필요 (JWT)
- **경로 파라미터**:
  - `id`: 약속 기록 ID (UUID)

---

### 6. 즐겨찾기 (Favorites)

#### 6.1 즐겨찾기 추가
```
POST /api/favorites
```
- **인증**: 필요 (JWT)
- **요청 본문**:
```json
{
  "placeId": "8241891",
  "name": "강남역",
  "address": "서울특별시 강남구 강남대로 396",
  "lat": 37.4981,
  "lng": 127.0276,
  "placeUrl": "http://place.map.kakao.com/m/8241891"
}
```

#### 6.2 즐겨찾기 목록 조회
```
GET /api/favorites
```
- **인증**: 필요 (JWT)
- **응답**: 즐겨찾기 배열

#### 6.3 즐겨찾기 삭제
```
DELETE /api/favorites/{placeId}
```
- **인증**: 필요 (JWT)
- **경로 파라미터**:
  - `placeId`: 카카오 장소 ID

---

## 🔐 인증 방법

### 방법 1: Authorization Bearer 헤더 (권장)

**Postman/프론트엔드에서**:
```javascript
fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

**Swagger UI에서**:
1. **Authorize** 버튼 클릭
2. **JWT-auth** 섹션에 `Bearer {token}` 입력
3. **Authorize** 클릭

### 방법 2: Cookie (브라우저)

카카오 로그인 후 자동으로 쿠키에 저장됨:
- `access_token`: Access Token (15분)
- `refresh_token`: Refresh Token (14일)

---

## 📝 요청/응답 예시

### 예시 1: 장소 검색

**요청**:
```
GET http://localhost:3001/api/search/suggest?q=강남역
```

**응답**:
```json
[
  {
    "placeId": "8241891",
    "name": "강남역",
    "address": "서울특별시 강남구 강남대로 396",
    "lat": 37.4981,
    "lng": 127.0276,
    "placeUrl": "http://place.map.kakao.com/m/8241891"
  }
]
```

### 예시 2: 중간 지점 추천

**요청**:
```
POST http://localhost:3001/api/recommend
Content-Type: application/json

{
  "participants": [
    { "label": "A", "lat": 37.5665, "lng": 126.9780 },
    { "label": "B", "lat": 37.5651, "lng": 126.9895 }
  ]
}
```

**응답**: (위의 추천 API 응답 예시 참고)

---

## ⚠️ 에러 처리

### 에러 응답 형식

모든 에러는 다음 형식을 따릅니다:

```json
{
  "error": "에러 메시지",
  "code": "에러 코드 (선택적)"
}
```

### 주요 에러 코드

#### 400 Bad Request
```json
{
  "error": "참가자는 2~4명이어야 합니다."
}
```

#### 401 Unauthorized
```json
{
  "error": "인증이 필요합니다.",
  "code": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "error": "공유 링크를 찾을 수 없습니다."
}
```

#### 409 Conflict
```json
{
  "error": "이미 즐겨찾기에 추가된 장소입니다."
}
```

#### 429 Too Many Requests
```json
{
  "error": "요청 한도 초과",
  "code": "KAKAO_RATE_LIMIT"
}
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 전체 플로우 테스트

1. **장소 검색**
   ```
   GET /api/search/suggest?q=강남역
   ```

2. **중간 지점 추천**
   ```
   POST /api/recommend
   {
     "participants": [
       { "label": "A", "lat": 37.5665, "lng": 126.9780 },
       { "label": "B", "lat": 37.5651, "lng": 126.9895 }
     ]
   }
   ```

3. **공유 링크 생성**
   ```
   POST /api/share
   {
     "data": {
       "anchor": {...},
       "participants": [...],
       "final": {...},
       "candidates": [...]
     }
   }
   ```

4. **공유 링크 조회**
   ```
   GET /api/share/{shareId}
   ```

### 시나리오 2: 인증 플로우 테스트

1. **카카오 로그인**
   - 브라우저에서 `GET /api/auth/kakao` 접속
   - 카카오 로그인 완료

2. **사용자 정보 조회**
   ```
   GET /api/auth/me
   Authorization: Bearer {token}
   ```

3. **약속 기록 생성**
   ```
   POST /api/meetings
   Authorization: Bearer {token}
   {
     "final": {...},
     "participantCount": 2
   }
   ```

4. **약속 기록 조회**
   ```
   GET /api/meetings
   Authorization: Bearer {token}
   ```

5. **즐겨찾기 추가**
   ```
   POST /api/favorites
   Authorization: Bearer {token}
   {
     "placeId": "...",
     "name": "...",
     ...
   }
   ```

6. **로그아웃**
   ```
   POST /api/auth/logout
   Authorization: Bearer {token}
   ```

---

## 🔧 프론트엔드 통합 예시

### React 예시

```typescript
// API 클라이언트 설정
const API_BASE_URL = 'http://localhost:3001';

// 인증이 필요한 요청
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken(); // 토큰 가져오기
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    credentials: 'include', // 쿠키 포함
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// 장소 검색
async function searchPlaces(query: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/search/suggest?q=${encodeURIComponent(query)}`
  );
  return response.json();
}

// 중간 지점 추천
async function recommend(participants: Participant[]) {
  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participants }),
  });
  return response.json();
}

// 약속 기록 생성
async function createMeeting(meetingData: CreateMeetingDto) {
  return fetchWithAuth('/api/meetings', {
    method: 'POST',
    body: JSON.stringify(meetingData),
  });
}

// 약속 기록 조회
async function getMeetings() {
  return fetchWithAuth('/api/meetings');
}
```

---

## 📊 Rate Limiting

### 제한 사항

- **검색 API** (`/api/search/suggest`): 30회/분
- **추천/공유 API** (`/api/recommend`, `/api/share`): 10회/분
- **기타 API**: 제한 없음

### Rate Limit 초과 시

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

---

## 💡 유용한 팁

### 1. Swagger UI 활용
- 모든 엔드포인트의 요청/응답 형식 확인
- 직접 API 호출 테스트
- 인증 토큰 설정으로 인증 필요한 API 테스트

### 2. 실제 데이터 사용
- 더미 데이터 대신 실제 카카오 API 데이터 사용
- `/api/search/suggest`로 실제 placeId 확인
- `/api/recommend`로 실제 추천 결과 확인

### 3. 에러 처리
- 모든 API는 표준 에러 형식 사용
- `error` 필드에서 에러 메시지 확인
- `code` 필드로 에러 타입 구분

### 4. 인증 토큰 관리
- Access Token: 15분 유효
- Refresh Token: 14일 유효
- 토큰 만료 시 `/api/auth/refresh`로 갱신

---

## 🔗 관련 링크

### 로컬 개발 환경
- **Swagger UI**: `http://localhost:3001/api-docs`
- **헬스 체크**: `http://localhost:3001/health`
- **API 베이스 URL**: `http://localhost:3001/api`

### 프로덕션 환경 (Render 배포 후)
- **Swagger UI**: `https://your-backend-service.onrender.com/api-docs`
- **헬스 체크**: `https://your-backend-service.onrender.com/health`
- **API 베이스 URL**: `https://your-backend-service.onrender.com/api`

⚠️ **중요**: 
- 프로덕션 URL은 백엔드 개발자로부터 받은 실제 Render 배포 URL을 사용하세요.
- Swagger UI에서 **서버 선택** 드롭다운을 통해 프로덕션 서버를 선택하면 모든 API 요청이 프로덕션 서버로 전송됩니다.

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: 인증이 필요한 API는 어떻게 테스트하나요?

**A**: Swagger UI에서 **Authorize** 버튼을 클릭하고 JWT 토큰을 입력하세요.

### Q2: 카카오 로그인은 어떻게 테스트하나요?

**A**: 브라우저에서 `GET /api/auth/kakao`에 접속하면 카카오 로그인 페이지로 리다이렉트됩니다.

### Q3: 실제 카카오 장소 데이터는 어떻게 얻나요?

**A**: `/api/search/suggest?q=강남역`을 호출하면 실제 카카오 API 데이터를 받을 수 있습니다.

### Q4: Rate Limit에 걸렸어요.

**A**: 1분 정도 기다린 후 다시 시도하세요. 검색은 30회/분, 추천/공유는 10회/분으로 제한됩니다.

### Q5: CORS 에러가 발생해요.

**A**: 
- 백엔드 개발자에게 `FRONTEND_URL` 환경 변수가 올바르게 설정되었는지 확인 요청
- 프로덕션에서는 프론트엔드 도메인이 정확히 등록되어 있어야 함
- 로컬 개발 시: `http://localhost:3000` (또는 프론트엔드 포트)

### Q6: Swagger UI에서 로그아웃 API 호출 시 "Failed to fetch" 에러가 나요.

**A**: 
- 이는 정상 동작입니다! 로그아웃 API는 카카오 로그아웃 URL로 리다이렉트하기 때문에 Swagger UI에서 에러로 표시됩니다.
- 실제로는 정상 작동하므로, 브라우저에서 직접 테스트하거나 Postman을 사용하세요.

### Q7: 프로덕션 서버 URL을 어떻게 알 수 있나요?

**A**: 
- 백엔드 개발자로부터 Render 배포 URL을 받으세요.
- 예: `https://meet-middle-backend.onrender.com`
- Swagger UI에서 서버 선택 드롭다운을 통해 프로덕션 서버로 전환 가능

---

## ✅ 체크리스트

### 로컬 개발 환경
프론트엔드 개발 시작 전:
- [ ] Swagger UI 접속 확인 (`http://localhost:3001/api-docs`)
- [ ] 모든 엔드포인트 확인
- [ ] 인증 플로우 이해
- [ ] 요청/응답 형식 확인
- [ ] 에러 처리 방법 확인

### 프로덕션 환경 (Render 배포 후)
- [ ] 백엔드 개발자로부터 Render 배포 URL 받기
- [ ] Swagger UI 접속 확인 (프로덕션 서버)
- [ ] 헬스 체크 응답 확인 (`GET /health`)
- [ ] 카카오 로그인 테스트
- [ ] 인증 필요한 API 테스트
- [ ] CORS 설정 확인
- [ ] 환경 변수 설정 (`BACKEND_URL`)

---

## 📚 추가 문서

- **`FRONTEND_DEPLOYMENT_GUIDE.md`**: 프로덕션 배포 서버 테스트 상세 가이드
- **`RENDER_QUICK_SETUP.md`**: Render 배포 빠른 설정 가이드 (백엔드 개발자용)
- **`SWAGGER_AUTH_GUIDE.md`**: Swagger UI 인증 설정 가이드
- **`SWAGGER_TROUBLESHOOTING.md`**: Swagger UI 문제 해결 가이드

---

이 가이드를 참고하여 백엔드 API를 테스트하고 프론트엔드를 개발하세요! 🚀

