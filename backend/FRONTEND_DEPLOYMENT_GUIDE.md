# 프론트엔드 개발자를 위한 배포 서버 테스트 가이드

## 📋 개요

이 문서는 Render에 배포된 백엔드 서버를 프론트엔드에서 테스트하는 방법을 설명합니다.

---

## 🌐 배포 서버 정보

### Swagger UI 접속

**프로덕션 서버:**
```
https://your-backend-service.onrender.com/api-docs
```

⚠️ **중요**: 
- `your-backend-service.onrender.com`을 백엔드 개발자로부터 받은 실제 Render 배포 URL로 변경하세요.
- Swagger UI에서 **서버 선택** 드롭다운을 통해 프로덕션 서버를 선택하면 모든 API 요청이 프로덕션 서버로 전송됩니다.

### 헬스 체크

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

## 🔐 인증 테스트

### 1. 카카오 로그인

#### 브라우저에서 테스트

1. 브라우저에서 다음 URL 접속:
   ```
   https://your-backend-service.onrender.com/api/auth/kakao
   ```

2. 카카오 로그인 화면이 표시됩니다 (항상 로그인 화면 표시 - `prompt=login` 적용)

3. 로그인 완료 후 프론트엔드로 리다이렉트:
   ```
   https://your-frontend-domain.com/?login=success
   ```

#### 프론트엔드 코드

```typescript
const handleKakaoLogin = () => {
  const backendUrl = 'https://your-backend-service.onrender.com';
  window.location.href = `${backendUrl}/api/auth/kakao`;
};
```

---

### 2. 사용자 정보 조회

#### Swagger UI에서 테스트

1. Swagger UI 접속: `https://your-backend-service.onrender.com/api-docs`
2. **Authorize** 버튼 클릭
3. **JWT-auth**에 토큰 입력 (Bearer 제외)
4. `GET /api/auth/me` 호출

#### 프론트엔드 코드

```typescript
const backendUrl = 'https://your-backend-service.onrender.com';

fetch(`${backendUrl}/api/auth/me`, {
  credentials: 'include', // 쿠키 포함 필수!
})
  .then(res => res.json())
  .then(user => {
    console.log('사용자 정보:', user);
  });
```

---

### 3. 로그아웃

#### ⚠️ 중요: Swagger UI에서 테스트 불가

로그아웃 API는 카카오 로그아웃 URL로 리다이렉트하기 때문에 Swagger UI에서 "Failed to fetch" 에러가 표시될 수 있습니다. 이는 정상 동작입니다.

#### 브라우저에서 테스트

1. 브라우저 개발자 도구 → Network 탭 열기
2. `POST https://your-backend-service.onrender.com/api/auth/logout` 호출
3. 카카오 로그아웃 페이지로 리다이렉트됨
4. 프론트엔드로 리다이렉트됨

#### 프론트엔드 코드

```typescript
const handleLogout = async () => {
  const backendUrl = 'https://your-backend-service.onrender.com';
  
  try {
    const response = await fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    // 리다이렉트가 자동으로 처리됨
    // 카카오 로그아웃 → 프론트엔드로 리다이렉트
  } catch (error) {
    // 리다이렉트로 인한 에러는 무시 가능
    console.log('로그아웃 완료');
  }
};
```

---

## 📝 API 테스트 시나리오

### 시나리오 1: 전체 플로우 테스트

1. **카카오 로그인**
   - 브라우저: `https://your-backend-service.onrender.com/api/auth/kakao`
   - 로그인 화면 표시 확인
   - 로그인 완료

2. **사용자 정보 조회**
   - Swagger UI: `GET /api/auth/me`
   - 또는 프론트엔드 코드로 호출

3. **장소 검색**
   - Swagger UI: `GET /api/search/suggest?q=강남역`
   - 실제 카카오 API 데이터 확인

4. **중간 지점 추천**
   - Swagger UI: `POST /api/recommend`
   - 실제 추천 결과 확인

5. **로그아웃**
   - 브라우저에서 직접 호출 (Swagger UI 불가)

---

## 🔧 환경 변수 설정

프론트엔드 프로젝트에 다음 환경 변수를 설정하세요:

### React (.env)

```env
REACT_APP_BACKEND_URL=https://your-backend-service.onrender.com
```

### Next.js (.env.local)

```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.onrender.com
```

### Vite (.env)

```env
VITE_BACKEND_URL=https://your-backend-service.onrender.com
```

---

## ⚠️ 주의사항

### 1. CORS 설정

프로덕션에서 CORS 에러가 발생하면:
- 백엔드 개발자에게 `FRONTEND_URL` 환경 변수 확인 요청
- 프론트엔드 도메인이 정확히 등록되어 있어야 함

### 2. 카카오 로그인 Redirect URI

카카오 로그인이 작동하지 않으면:
- 백엔드 개발자에게 카카오 개발자 콘솔에 Redirect URI가 등록되었는지 확인 요청
- 프로덕션 Redirect URI: `https://your-backend-service.onrender.com/api/auth/kakao/callback`

### 3. 쿠키 전송

인증이 필요한 API 호출 시:
- `credentials: 'include'` (fetch) 또는 `withCredentials: true` (axios) 필수
- CORS 설정에서 `credentials: true` 확인

---

## 📊 Swagger UI 활용 팁

### 서버 선택

Swagger UI 상단의 **서버 선택** 드롭다운에서:
- **로컬 개발 서버**: `http://localhost:3001`
- **프로덕션 서버**: `https://your-backend-service.onrender.com`

프로덕션 서버를 선택하면 모든 API 요청이 프로덕션 서버로 전송됩니다.

### 인증 토큰 관리

1. 카카오 로그인 후 브라우저 개발자 도구 → Application → Cookies
2. `access_token` 쿠키의 Value 복사
3. Swagger UI → Authorize → JWT-auth에 붙여넣기 (Bearer 제외)

---

## ✅ 체크리스트

프론트엔드 개발 시작 전:
- [ ] 백엔드 개발자로부터 Render 배포 URL 받기
- [ ] Swagger UI 접속 확인
- [ ] 헬스 체크 응답 확인
- [ ] 환경 변수 설정
- [ ] 카카오 로그인 테스트
- [ ] 인증 필요한 API 테스트

---

## 📞 문제 해결

### 문제 1: Swagger UI 접속 불가

**해결**:
- URL이 정확한지 확인
- 백엔드 서버가 실행 중인지 확인
- Render 대시보드에서 서비스 상태 확인

### 문제 2: API 호출 시 CORS 에러

**해결**:
- 백엔드 개발자에게 `FRONTEND_URL` 확인 요청
- 프론트엔드 도메인이 정확히 등록되었는지 확인

### 문제 3: 카카오 로그인 실패

**해결**:
- 백엔드 개발자에게 카카오 개발자 콘솔 설정 확인 요청
- Redirect URI가 등록되었는지 확인

---

이 가이드를 참고하여 배포된 백엔드 서버를 테스트하세요! 🚀

