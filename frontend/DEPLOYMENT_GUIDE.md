# 배포 가이드 (Deployment Guide)

이 문서는 Meet-Middle 프론트엔드를 Vercel로 배포하고, 백엔드(Render)와 연동하기 위한 설정 가이드입니다.

---

## 📋 목차

1. [Vercel 배포 설정](#1-vercel-배포-설정)
2. [백엔드(Render) 설정](#2-백엔드render-설정)
3. [배포 후 확인 사항](#3-배포-후-확인-사항)
4. [문제 해결](#4-문제-해결)

---

## 1. Vercel 배포 설정

### 1.1 Vercel 계정 생성 및 프로젝트 연결

1. **Vercel 가입**

   - [Vercel 공식 사이트](https://vercel.com) 접속
   - GitHub 계정으로 가입 (권장)

2. **프로젝트 Import**
   - Vercel 대시보드에서 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택 또는 Git 저장소 URL 입력
   - 프로젝트 루트 디렉토리를 `meet-middle/frontend`로 설정

### 1.2 빌드 설정 (Build Settings)

Vercel가 자동으로 Next.js를 감지하지만, 명시적으로 설정하려면:

**Framework Preset:** `Next.js`
**Root Directory:** `meet-middle/frontend`
**Build Command:** `npm run build` (기본값)
**Output Directory:** `.next` (기본값, Next.js가 자동 설정)
**Install Command:** `npm install` (기본값)

### 1.3 환경 변수 설정 (Environment Variables)

Vercel 대시보드에서 프로젝트 → Settings → Environment Variables에서 다음 환경 변수들을 추가해야 합니다:

#### 필수 환경 변수

```bash
# 백엔드 API URL
NEXT_PUBLIC_BACKEND_URL=https://meet-middle-backend.onrender.com

# 카카오 맵 JavaScript API 키
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_javascript_key_here
```

#### 환경 변수 추가 방법

1. Vercel 프로젝트 대시보드 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Environment Variables** 선택
4. 다음 변수들을 추가:

| Key                         | Value                                         | Environment                           |
| --------------------------- | --------------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`   | `https://meet-middle-backend.onrender.com`    | Production, Preview, Development 모두 |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 카카오 개발자 콘솔에서 발급받은 JavaScript 키 | Production, Preview, Development 모두 |

**⚠️ 중요:**

- `NEXT_PUBLIC_` 접두사가 붙은 환경 변수는 클라이언트 사이드에서 접근 가능합니다
- Production, Preview, Development 환경 모두에 동일하게 설정하는 것을 권장합니다
- 환경 변수 추가 후 **반드시 재배포**해야 적용됩니다

### 1.4 카카오 맵 API 키 확인

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 앱 선택 → **앱 설정** → **플랫폼** 메뉴
3. **JavaScript SDK 도메인**에 Vercel 배포 URL 추가:
   ```
   https://your-project.vercel.app
   ```
   또는 와일드카드 사용:
   ```
   *.vercel.app
   ```

### 1.5 배포 실행

1. 환경 변수 설정 완료 후
2. Vercel 대시보드에서 **Deployments** 탭으로 이동
3. 최신 배포에서 **Redeploy** 버튼 클릭
   - 또는 Git 저장소에 코드를 푸시하면 자동으로 배포됩니다

---

## 2. 백엔드(Render) 설정

### 2.1 CORS 설정 (가장 중요!)

백엔드 개발자가 Render 대시보드에서 다음 설정을 해야 합니다:

#### NestJS CORS 설정 예시

```typescript
// main.ts 또는 app.module.ts
app.enableCors({
  origin: [
    "http://localhost:3000",
    "https://your-project.vercel.app", // Vercel 배포 URL
    "https://*.vercel.app", // 모든 Vercel Preview URL 허용
  ],
  credentials: true, // 쿠키 포함 필수
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

#### Render 환경 변수 설정

Render 대시보드에서 다음 환경 변수가 설정되어 있는지 확인:

```bash
# CORS 설정 (선택사항 - 코드에서 직접 설정하는 경우 불필요)
CORS_ORIGIN=https://your-project.vercel.app
```

### 2.2 쿠키 설정 확인

백엔드에서 쿠키 설정이 올바른지 확인해야 합니다:

```typescript
// 쿠키 설정 예시 (NestJS)
cookieOptions: {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // HTTPS에서만
  sameSite: 'none',  // 크로스 오리진 요청을 위해 필요
  domain: undefined,  // 모든 도메인에서 사용 가능하도록
  path: '/',
}
```

**⚠️ 중요:**

- `sameSite: 'none'`을 사용하려면 **반드시 `secure: true`**여야 합니다
- Render는 HTTPS를 제공하므로 프로덕션에서는 `secure: true`로 설정

### 2.3 카카오 로그인 리다이렉트 URI 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 앱 선택 → **제품 설정** → **카카오 로그인** → **Redirect URI 등록**
3. 다음 URI들을 추가:
   ```
   http://localhost:3000/api/auth/kakao/callback  (로컬 개발용)
   https://meet-middle-backend.onrender.com/api/auth/kakao/callback  (Render 백엔드)
   ```
   - 프론트엔드 Vercel URL은 추가할 필요 없습니다 (백엔드가 콜백 처리)

---

## 3. 배포 후 확인 사항

### 3.1 프론트엔드 확인

1. **환경 변수 확인**

   - 브라우저 개발자 도구 → Console
   - 네트워크 요청이 올바른 백엔드 URL로 가는지 확인

2. **카카오 맵 로드 확인**

   - 지도가 정상적으로 표시되는지 확인
   - 콘솔에 카카오맵 관련 에러가 없는지 확인

3. **인증 기능 확인**

   - 로그인 버튼 클릭 → 카카오 로그인 팝업 정상 동작 확인
   - 로그인 후 헤더에 사용자 정보가 표시되는지 확인

4. **API 연동 확인**
   - 장소 검색 기능 동작 확인
   - 추천 받기 기능 동작 확인
   - 공유 링크 생성 동작 확인

### 3.2 백엔드 확인

1. **CORS 에러 확인**

   - 브라우저 개발자 도구 → Console에서 CORS 관련 에러가 없는지 확인
   - Network 탭에서 OPTIONS 요청이 200으로 응답하는지 확인

2. **쿠키 전송 확인**
   - Network 탭 → 요청 헤더에서 `Cookie`가 포함되는지 확인
   - 응답 헤더에서 `Set-Cookie`가 포함되는지 확인

---

## 4. 문제 해결

### 4.1 CORS 에러

**증상:**

```
Access to fetch at 'https://meet-middle-backend.onrender.com/...' from origin 'https://your-project.vercel.app' has been blocked by CORS policy
```

**해결 방법:**

1. 백엔드 개발자에게 Vercel URL을 CORS 허용 목록에 추가 요청
2. `credentials: true` 설정 확인
3. `sameSite: 'none'` 및 `secure: true` 설정 확인

### 4.2 쿠키가 전송되지 않는 문제

**증상:**

- 로그인은 되지만 새로고침하면 로그아웃됨
- 인증이 필요한 API 호출 시 401 에러

**해결 방법:**

1. 백엔드 쿠키 설정 확인:
   - `sameSite: 'none'`
   - `secure: true`
   - `httpOnly: true`
2. 프론트엔드에서 `withCredentials: true` 설정 확인 (이미 되어 있음)
3. 브라우저에서 쿠키가 차단되지 않았는지 확인

### 4.3 카카오 맵이 로드되지 않는 문제

**증상:**

- "지도를 불러오는 중..."에서 멈춤
- 콘솔에 JavaScript SDK 도메인 에러

**해결 방법:**

1. 카카오 개발자 콘솔에서 JavaScript SDK 도메인에 Vercel URL 추가
2. 환경 변수 `NEXT_PUBLIC_KAKAO_MAP_KEY`가 올바르게 설정되었는지 확인
3. Vercel에서 환경 변수 변경 후 재배포

### 4.4 환경 변수가 적용되지 않는 문제

**해결 방법:**

1. Vercel에서 환경 변수 추가 후 **반드시 재배포**
2. 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)
3. Vercel 대시보드 → Deployment → Logs에서 빌드 로그 확인

### 4.5 API 호출 실패

**해결 방법:**

1. 브라우저 개발자 도구 → Network 탭에서 요청 상태 확인
2. 백엔드 서버가 실행 중인지 확인
3. 백엔드 로그 확인 (Render 대시보드 → Logs)

---

## 5. 체크리스트

배포 전 확인 사항:

### 프론트엔드 (Vercel)

- [ ] Vercel 프로젝트 생성 및 저장소 연결
- [ ] 환경 변수 `NEXT_PUBLIC_BACKEND_URL` 설정
- [ ] 환경 변수 `NEXT_PUBLIC_KAKAO_MAP_KEY` 설정
- [ ] 카카오 개발자 콘솔에 Vercel URL을 JavaScript SDK 도메인에 추가
- [ ] 빌드 및 배포 성공 확인

### 백엔드 (Render)

- [ ] CORS 설정에 Vercel URL 추가
- [ ] 쿠키 설정 확인 (`sameSite: 'none'`, `secure: true`)
- [ ] 카카오 로그인 Redirect URI 설정 확인
- [ ] 서버 정상 작동 확인

### 공통

- [ ] 로컬에서 테스트 완료
- [ ] 모든 기능 정상 동작 확인
- [ ] 에러 로그 확인

---

## 6. 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [카카오 개발자 콘솔](https://developers.kakao.com/)
- [Render 공식 문서](https://render.com/docs)

---

## 7. 백엔드 개발자에게 전달할 내용

백엔드 개발자에게 다음 사항을 전달해주세요:

1. **Vercel 배포 URL**: `https://your-project.vercel.app`
2. **CORS 설정 요청**: 위의 CORS 설정 섹션 참고
3. **쿠키 설정 확인**: `sameSite: 'none'`, `secure: true` 필수
4. **카카오 Redirect URI**: Render 백엔드 URL로 이미 설정되어 있다고 가정

---

**마지막 업데이트:** 2025년 1월
