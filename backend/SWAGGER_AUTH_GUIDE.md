# Swagger UI 인증 설정 가이드

## 🔐 Swagger UI에서 인증 설정하기

Swagger UI의 **Authorize** 버튼을 클릭하면 두 가지 인증 방법이 표시됩니다:

1. **JWT-auth (http, Bearer)**
2. **cookie (apiKey)**

---

## 방법 1: JWT-auth (Bearer Token) - 권장 ⭐

### ⚠️ 중요: Bearer 접두사 입력 금지!

**JWT-auth에는 토큰 값만 입력하세요!** 
- ❌ `Bearer {token}` 형식으로 입력하면 안 됩니다!
- ✅ `{token}` 형식으로만 입력하세요!

Swagger UI가 자동으로 `Bearer` 접두사를 추가하므로, `Bearer`를 포함하면 `Bearer Bearer ...`가 되어 인증이 실패합니다.

### 설정 방법

1. Swagger UI 상단의 **Authorize** 버튼 클릭
2. **JWT-auth** 섹션의 "Enter JWT token" 필드에 **토큰 값만** 입력:
   
   ✅ **올바른 입력 (토큰만)**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzA0NTQzMjAwLCJleHAiOjE3MDQ1NDQxMDB9...
   ```
   
   ❌ **잘못된 입력 (Bearer 포함)**:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← 이렇게 하면 안 됩니다!
   ```

3. **Authorize** 클릭 (또는 Enter 키)
4. ✅ "Authorized" 상태가 되면 완료

### 🔍 문제 해결: 401 Unauthorized 에러가 발생하는 경우

**증상**: 
- curl 명령에 `Authorization: Bearer Bearer ...`가 표시됨
- 401 Unauthorized 에러 발생

**원인**: 
- JWT-auth 필드에 `Bearer {token}` 형식으로 입력했음
- Swagger가 자동으로 `Bearer`를 추가해서 `Bearer Bearer`가 됨

**해결 방법**:
1. **Authorize** 버튼 클릭
2. **JWT-auth** 섹션에서 **Logout** 클릭 (기존 인증 제거)
3. 토큰 값만 입력 (Bearer 제외)
4. **Authorize** 클릭
5. 다시 API 호출 테스트

### 토큰 얻는 방법

#### 방법 A: 카카오 로그인 후 토큰 추출
1. 브라우저에서 `http://localhost:3001/api/auth/kakao` 접속
2. 카카오 로그인 완료
3. 브라우저 개발자 도구 열기 (F12)
4. **Application** 탭 → **Cookies** → `http://localhost:3001`
5. `access_token` 쿠키의 **Value** 복사

#### 방법 B: API 응답에서 토큰 확인
- 카카오 로그인 후 `/api/auth/me` 호출 시 네트워크 탭에서 확인

---

## 방법 2: Cookie 인증

### 언제 사용하나요?

- 브라우저에 이미 `access_token` 쿠키가 설정된 경우
- JWT-auth와 동일한 토큰을 Cookie 방식으로도 테스트하고 싶은 경우

### 설정 방법

1. Swagger UI 상단의 **Authorize** 버튼 클릭
2. **cookie (apiKey)** 섹션의 "Value" 필드에:
   - **JWT 토큰 값만** 입력 (⚠️ `Bearer` 접두사 제외!)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzA0NTQzMjAwLCJleHAiOjE3MDQ1NDQxMDB9...
   ```
3. **Authorize** 클릭

### ⚠️ 중요 주의사항

- **Cookie Value에는 `Bearer` 접두사를 입력하지 않습니다!**
- JWT-auth에서 사용한 토큰 값 그대로 사용 (Bearer 제외)
- Cookie 이름은 자동으로 `access_token`으로 설정됨

---

## 📋 요약 비교

| 항목 | JWT-auth (Bearer) | Cookie |
|------|-------------------|--------|
| **입력 형식** | `{token}` (Bearer 제외) ⚠️ | `{token}` (Bearer 제외) |
| **권장 여부** | ✅ 권장 | 선택사항 |
| **사용 편의성** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **브라우저 자동 전송** | ❌ (헤더에 수동 설정) | ✅ (쿠키 자동 전송) |

⚠️ **주의**: JWT-auth에 `Bearer`를 포함하면 `Bearer Bearer`가 되어 인증 실패!

---

## 🔄 인증 방법 선택 가이드

### 시나리오 1: 일반적인 API 테스트
→ **JWT-auth (Bearer Token)** 사용 권장

### 시나리오 2: 브라우저에서 카카오 로그인 후 테스트
→ **Cookie 인증** 사용 가능 (쿠키가 이미 설정된 경우)

### 시나리오 3: 프론트엔드 개발 시
→ **JWT-auth (Bearer Token)** 사용 권장 (프론트엔드에서도 헤더로 전송)

---

## 🧪 테스트 방법

### 1단계: 토큰 얻기
```bash
# 브라우저에서 카카오 로그인
http://localhost:3001/api/auth/kakao
```

### 2단계: 토큰 확인
- 개발자 도구 → Application → Cookies → `access_token` 값 복사

### 3단계: Swagger UI에서 인증 설정
1. `http://localhost:3001/api-docs` 접속
2. **Authorize** 클릭
3. **JWT-auth**에 토큰 입력 (Bearer 제외 권장)
4. **Authorize** 클릭

### 4단계: 인증 필요한 API 테스트
- 예: `GET /api/auth/me` 호출
- 예: `GET /api/meetings` 호출
- 예: `POST /api/favorites` 호출

---

## ❓ 자주 묻는 질문 (FAQ)

### Q1: JWT-auth에 `Bearer`를 포함해야 하나요?

**A**: ❌ **아니요! 절대 포함하지 마세요!** 
- Swagger UI가 자동으로 `Bearer` 접두사를 추가합니다.
- `Bearer {token}` 형식으로 입력하면 `Bearer Bearer {token}`이 되어 인증이 실패합니다.
- **토큰 값만 입력하세요!**

### Q2: Cookie 인증에 `Bearer`를 포함해야 하나요?

**A**: ❌ **아니요!** Cookie Value에는 토큰 값만 입력합니다. `Bearer` 접두사를 포함하면 인증이 실패합니다.

### Q3: 두 인증 방법을 동시에 사용할 수 있나요?

**A**: 네, 가능합니다. 하지만 일반적으로 하나만 사용하는 것을 권장합니다. JWT-auth (Bearer Token)를 권장합니다.

### Q4: 토큰이 만료되면 어떻게 하나요?

**A**: 
1. `/api/auth/refresh` 엔드포인트로 새 토큰 발급
2. 또는 다시 카카오 로그인

### Q5: Cookie 인증이 작동하지 않아요.

**A**: 
- Cookie Value에 `Bearer`가 포함되어 있는지 확인
- 토큰 값이 올바른지 확인
- 브라우저 쿠키 설정 확인 (httpOnly 쿠키는 JavaScript에서 접근 불가)

---

## ✅ 체크리스트

인증 설정 전:
- [ ] 카카오 로그인 완료
- [ ] `access_token` 쿠키 값 확인
- [ ] Swagger UI 접속 (`http://localhost:3001/api-docs`)

인증 설정:
- [ ] **JWT-auth**: 토큰 입력 (Bearer 제외 권장)
- [ ] **Authorize** 클릭
- [ ] "Authorized" 상태 확인

테스트:
- [ ] `GET /api/auth/me` 호출 성공
- [ ] 인증 필요한 다른 API 호출 성공

---

이 가이드를 참고하여 Swagger UI에서 API를 테스트하세요! 🚀

