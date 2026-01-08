# Swagger UI 문제 해결 가이드

## 🚨 자주 발생하는 문제

### 문제 1: 401 Unauthorized 에러 - "Bearer Bearer" 중복

#### 증상
- Swagger UI에서 API 호출 시 401 Unauthorized 에러 발생
- curl 명령에 `Authorization: Bearer Bearer eyJhbGci...`가 표시됨
- 에러 메시지: `"error": "인증이 필요합니다."`

#### 원인
JWT-auth 필드에 `Bearer {token}` 형식으로 입력했기 때문입니다.

Swagger UI의 `addBearerAuth`는 자동으로 `Bearer` 접두사를 추가하므로:
- 입력: `Bearer eyJhbGci...`
- 결과: `Authorization: Bearer Bearer eyJhbGci...` ❌

#### 해결 방법

1. **Authorize** 버튼 클릭
2. **JWT-auth** 섹션에서 **Logout** 클릭 (기존 인증 제거)
3. 토큰 값만 입력 (⚠️ `Bearer` 제외):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzA0NTQzMjAwLCJleHAiOjE3MDQ1NDQxMDB9...
   ```
4. **Authorize** 클릭
5. 다시 API 호출 테스트

#### 예시

**❌ 잘못된 입력:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**✅ 올바른 입력:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 문제 2: 토큰을 얻는 방법

#### 방법 A: 카카오 로그인 후 쿠키에서 추출

1. 브라우저에서 `http://localhost:3001/api/auth/kakao` 접속
2. 카카오 로그인 완료
3. 브라우저 개발자 도구 열기 (F12)
4. **Application** 탭 → **Cookies** → `http://localhost:3001`
5. `access_token` 쿠키의 **Value** 복사
6. Swagger UI의 JWT-auth 필드에 붙여넣기 (Bearer 제외)

#### 방법 B: 네트워크 탭에서 확인

1. 카카오 로그인 완료
2. 개발자 도구 → **Network** 탭
3. `/api/auth/me` 요청 클릭
4. **Headers** → **Request Headers** → `Authorization` 헤더 확인
5. `Bearer ` 이후의 토큰 값만 복사

---

### 문제 3: 카카오 로그인 Redirect URI 설정

#### 현재 설정 확인

카카오 개발자 콘솔에서 다음 URI가 등록되어 있어야 합니다:

```
http://localhost:3001/api/auth/kakao/callback
```

#### 프로덕션 배포 시

프로덕션 배포 후에는 다음 URI도 추가해야 합니다:

```
https://your-backend-service.onrender.com/api/auth/kakao/callback
```

#### 설정 방법

1. 카카오 개발자 콘솔 접속
2. **내 애플리케이션** → 애플리케이션 선택
3. **제품 설정** → **카카오 로그인** → **활성화 설정**
4. **Redirect URI** 섹션에서:
   - `http://localhost:3001/api/auth/kakao/callback` 추가
   - 프로덕션 URL도 추가 (배포 후)

---

### 문제 4: Cookie 인증이 작동하지 않음

#### 증상
- Cookie 인증을 설정했지만 401 에러 발생
- 브라우저에 쿠키가 설정되어 있지만 인증 실패

#### 원인
- Cookie Value에 `Bearer` 접두사가 포함됨
- 토큰이 만료됨
- 쿠키가 httpOnly로 설정되어 JavaScript에서 접근 불가

#### 해결 방법

1. **Cookie Value 확인**:
   - `Bearer` 접두사 제거
   - 토큰 값만 입력

2. **토큰 만료 확인**:
   - Access Token은 15분간 유효
   - 만료 시 `/api/auth/refresh`로 갱신 또는 재로그인

3. **쿠키 확인**:
   - 개발자 도구 → Application → Cookies
   - `access_token` 쿠키가 존재하는지 확인
   - Value 복사하여 Swagger UI에 입력

---

## ✅ 체크리스트

인증 문제 해결 전 확인사항:

- [ ] JWT-auth에 `Bearer` 접두사 없이 토큰만 입력했는가?
- [ ] 토큰이 만료되지 않았는가? (15분 유효)
- [ ] 카카오 로그인이 정상적으로 완료되었는가?
- [ ] 카카오 개발자 콘솔에 Redirect URI가 등록되어 있는가?
- [ ] 서버가 정상적으로 실행 중인가?

---

## 🔍 디버깅 팁

### 1. curl 명령 확인

Swagger UI에서 API 호출 시 생성되는 curl 명령을 확인하세요:

**올바른 형식:**
```bash
Authorization: Bearer eyJhbGci...
```

**잘못된 형식:**
```bash
Authorization: Bearer Bearer eyJhbGci...  ← Bearer가 중복!
```

### 2. 네트워크 탭 확인

브라우저 개발자 도구 → Network 탭에서:
- 요청 헤더의 `Authorization` 확인
- 응답 상태 코드 확인
- 에러 메시지 확인

### 3. 서버 로그 확인

서버 콘솔에서:
- JWT 검증 에러 메시지 확인
- 토큰 파싱 에러 확인

---

## 📞 추가 도움

문제가 지속되면:
1. 서버 재시작
2. 브라우저 캐시 삭제
3. Swagger UI 새로고침
4. 토큰 재발급 (카카오 재로그인)

---

이 가이드를 참고하여 문제를 해결하세요! 🚀

