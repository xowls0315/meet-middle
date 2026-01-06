# 카카오 API 키 종류 및 차이점 설명

## 📋 카카오 개발자 콘솔의 API 키 종류

카카오 개발자 콘솔에는 여러 종류의 API 키가 있습니다. 각각의 용도가 다르므로 올바르게 사용해야 합니다.

---

## 🔑 주요 API 키 종류

### 1. REST API 키 (REST API Key)

**용도**: 카카오 로컬 API 등 REST API 호출 시 사용

**사용 예시**:
- 장소 검색 (`/v2/local/search/keyword`)
- 카테고리 검색 (`/v2/local/search/category`)
- 주소 검색 등

**헤더 형식**:
```
Authorization: KakaoAK {REST_API_KEY}
```

**코드에서 사용 위치**:
```typescript
// backend/src/kakao-local/kakao-local.service.ts
this.restApiKey = this.configService.get<string>('KAKAO_REST_KEY');
// 헤더에 사용
headers: {
  Authorization: `KakaoAK ${this.restApiKey}`,
}
```

**환경 변수 이름**: `KAKAO_REST_KEY`

---

### 2. Client ID (클라이언트 ID)

**용도**: OAuth 2.0 인증 (카카오 로그인) 시 사용

**사용 예시**:
- 카카오 로그인 시작
- OAuth 인증 플로우

**코드에서 사용 위치**:
```typescript
// backend/src/auth/strategies/kakao.strategy.ts
// OAuth 인증에 사용
const clientID = configService.get<string>('KAKAO_CLIENT_ID');
```

**환경 변수 이름**: `KAKAO_CLIENT_ID`

**⚠️ 중요**: 
- 카카오 개발자 콘솔에서 **"REST API 키"**와 **"Client ID"**는 **다른 값**입니다!
- OAuth 인증에는 반드시 **Client ID**를 사용해야 합니다.

---

### 3. Client Secret (클라이언트 시크릿)

**용도**: OAuth 2.0 인증 (카카오 로그인) 시 사용

**사용 예시**:
- 카카오 로그인 콜백 처리
- 토큰 교환

**코드에서 사용 위치**:
```typescript
// backend/src/auth/strategies/kakao.strategy.ts
const clientSecret = configService.get<string>('KAKAO_CLIENT_SECRET');
```

**환경 변수 이름**: `KAKAO_CLIENT_SECRET`

**⚠️ 중요**: 
- Client Secret은 보안상 매우 중요합니다.
- 절대 공개되지 않도록 주의해야 합니다.

---

## 🔍 카카오 개발자 콘솔에서 확인하는 방법

### 1. REST API 키 확인

1. 카카오 개발자 콘솔 접속
2. **내 애플리케이션** → 애플리케이션 선택
3. **앱 설정** → **앱 키** 섹션
4. **REST API 키** 복사

### 2. Client ID 확인

1. 카카오 개발자 콘솔 접속
2. **내 애플리케이션** → 애플리케이션 선택
3. **제품 설정** → **카카오 로그인** → **일반**
4. **REST API 키** 값 확인 (⚠️ 주의: 여기서도 "REST API 키"라고 표시되지만, OAuth에서는 이 값을 Client ID로 사용)

**⚠️ 혼란스러운 점**: 
- 카카오 개발자 콘솔에서 OAuth Client ID는 "REST API 키"와 **같은 값**을 사용합니다.
- 하지만 코드에서는 목적에 따라 구분해서 사용해야 합니다:
  - REST API 호출: `KAKAO_REST_KEY` (환경 변수 이름)
  - OAuth 인증: `KAKAO_CLIENT_ID` (환경 변수 이름)

### 3. Client Secret 확인

1. 카카오 개발자 콘솔 접속
2. **내 애플리케이션** → 애플리케이션 선택
3. **제품 설정** → **카카오 로그인** → **보안**
4. **Client Secret** 생성 또는 확인

---

## ⚠️ 현재 코드의 문제점

### 문제: `kakao.strategy.ts`에서 잘못된 키 사용

**현재 코드** (잘못됨):
```typescript
// backend/src/auth/strategies/kakao.strategy.ts
const clientID = configService.get<string>('KAKAO_REST_KEY'); // ❌ 잘못됨!
```

**올바른 코드**:
```typescript
// backend/src/auth/strategies/kakao.strategy.ts
const clientID = configService.get<string>('KAKAO_CLIENT_ID'); // ✅ 올바름
```

### 왜 문제인가?

1. **의미적 혼란**: 
   - `KAKAO_REST_KEY`는 REST API 호출용 키를 의미합니다.
   - OAuth 인증에는 `KAKAO_CLIENT_ID`를 사용해야 합니다.

2. **실제 값은 같지만**:
   - 카카오 개발자 콘솔에서 REST API 키와 Client ID는 같은 값입니다.
   - 하지만 코드에서는 목적에 따라 구분해야 합니다.

3. **유지보수성**:
   - 나중에 카카오가 키를 분리할 수 있습니다.
   - 명확한 변수 이름을 사용하는 것이 좋습니다.

---

## 📊 비교표

| 항목 | REST API 키 | Client ID | Client Secret |
|------|------------|-----------|---------------|
| **환경 변수 이름** | `KAKAO_REST_KEY` | `KAKAO_CLIENT_ID` | `KAKAO_CLIENT_SECRET` |
| **용도** | REST API 호출 | OAuth 인증 | OAuth 인증 |
| **사용 위치** | `kakao-local.service.ts` | `kakao.strategy.ts` | `kakao.strategy.ts` |
| **헤더 형식** | `KakaoAK {key}` | OAuth 플로우 | OAuth 플로우 |
| **공개 여부** | 공개 가능 | 공개 가능 | 비공개 (보안) |
| **카카오 콘솔 위치** | 앱 설정 → 앱 키 | 제품 설정 → 카카오 로그인 | 제품 설정 → 카카오 로그인 → 보안 |

---

## ✅ 올바른 사용 방법

### 환경 변수 설정 (.env)

```env
# REST API 호출용 (장소 검색 등)
KAKAO_REST_KEY=your_rest_api_key_here

# OAuth 인증용 (카카오 로그인)
KAKAO_CLIENT_ID=your_client_id_here  # REST API 키와 같은 값이지만 의미적으로 구분
KAKAO_CLIENT_SECRET=your_client_secret_here
```

### 코드에서 사용

#### 1. REST API 호출 (장소 검색)

```typescript
// backend/src/kakao-local/kakao-local.service.ts
this.restApiKey = this.configService.get<string>('KAKAO_REST_KEY');

// 헤더에 사용
headers: {
  Authorization: `KakaoAK ${this.restApiKey}`,
}
```

#### 2. OAuth 인증 (카카오 로그인)

```typescript
// backend/src/auth/strategies/kakao.strategy.ts
const clientID = configService.get<string>('KAKAO_CLIENT_ID'); // ✅ 올바름
const clientSecret = configService.get<string>('KAKAO_CLIENT_SECRET');
```

---

## 🔧 수정 권장사항

### 현재 코드 수정

```typescript
// backend/src/auth/strategies/kakao.strategy.ts

// ❌ 현재 (잘못됨)
const clientID = configService.get<string>('KAKAO_REST_KEY');

// ✅ 수정 (올바름)
const clientID = configService.get<string>('KAKAO_CLIENT_ID');
```

### 환경 변수 설정

```env
# .env 파일
KAKAO_REST_KEY=abc123def456...        # REST API 호출용
KAKAO_CLIENT_ID=abc123def456...        # OAuth 인증용 (REST API 키와 같은 값)
KAKAO_CLIENT_SECRET=xyz789uvw012...    # OAuth 인증용 (보안)
```

**참고**: 
- 현재 카카오 개발자 콘솔에서는 REST API 키와 Client ID가 같은 값입니다.
- 하지만 코드에서는 목적에 따라 구분해서 사용하는 것이 좋습니다.
- 나중에 카카오가 키를 분리할 경우를 대비하기 위함입니다.

---

## 📝 요약

1. **`KAKAO_REST_KEY`**: 
   - REST API 호출용 (장소 검색 등)
   - 헤더: `Authorization: KakaoAK {key}`
   - 사용 위치: `kakao-local.service.ts`

2. **`KAKAO_CLIENT_ID`**: 
   - OAuth 인증용 (카카오 로그인)
   - 사용 위치: `kakao.strategy.ts`
   - 현재는 REST API 키와 같은 값이지만 의미적으로 구분

3. **`KAKAO_CLIENT_SECRET`**: 
   - OAuth 인증용 (카카오 로그인)
   - 보안상 중요 (비공개)
   - 사용 위치: `kakao.strategy.ts`

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: REST API 키와 Client ID가 같은 값인데 왜 구분하나요?

**A**: 
- 현재는 같은 값이지만, 카카오가 나중에 키를 분리할 수 있습니다.
- 코드의 가독성과 유지보수성을 위해 구분하는 것이 좋습니다.
- 의미적으로 다른 용도이므로 명확하게 구분해야 합니다.

### Q2: 현재 코드가 작동하는데 수정해야 하나요?

**A**: 
- 현재는 작동할 수 있습니다 (같은 값이므로).
- 하지만 의미적으로 올바르지 않으므로 수정을 권장합니다.
- 나중에 문제가 발생할 수 있으므로 지금 수정하는 것이 좋습니다.

### Q3: 환경 변수에 같은 값을 두 번 입력해야 하나요?

**A**: 
- 현재는 같은 값을 입력해야 합니다.
- 하지만 의미적으로 구분하기 위해 별도의 환경 변수로 관리하는 것이 좋습니다.
- 나중에 카카오가 키를 분리하면 쉽게 대응할 수 있습니다.

---

이 가이드를 참고하여 올바른 API 키를 사용하세요! 🚀

