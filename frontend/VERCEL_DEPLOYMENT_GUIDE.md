# 🚀 Vercel 배포 가이드

이 문서는 Meet-Middle 프론트엔드를 Vercel에 배포하기 위한 상세한 설정 가이드입니다.

---

## 📋 목차

1. [Vercel 배포 전 체크리스트](#1-vercel-배포-전-체크리스트)
2. [Vercel 설정](#2-vercel-설정)
3. [백엔드 설정 (Render)](#3-백엔드-설정-render)
4. [카카오 개발자 콘솔 설정](#4-카카오-개발자-콘솔-설정)
5. [배포 후 확인 사항](#5-배포-후-확인-사항)
6. [문제 해결](#6-문제-해결)

---

## 1. Vercel 배포 전 체크리스트

### 필수 확인 사항

- [ ] Git 저장소에 코드가 커밋되어 있는지 확인
- [ ] `package.json`의 빌드 스크립트가 올바른지 확인 (`"build": "next build"`)
- [ ] 로컬에서 `npm run build`가 성공하는지 확인
- [ ] `.gitignore`에 `.env.local`, `.next`, `node_modules` 등이 포함되어 있는지 확인

---

## 2. Vercel 설정

### 2.1. Vercel 프로젝트 생성

1. **Vercel 웹사이트 접속**

   - https://vercel.com 접속
   - GitHub 계정으로 로그인 (또는 회원가입)

2. **새 프로젝트 추가**

   - 대시보드에서 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택 또는 Import

3. **프로젝트 설정**
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `meet-middle/frontend` (프론트엔드 폴더가 루트가 아닌 경우)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

### 2.2. 환경 변수 설정

Vercel 대시보드에서 프로젝트 설정 → **Environment Variables** 메뉴로 이동하여 다음 환경 변수를 추가합니다.

#### 필수 환경 변수

| 환경 변수 이름              | 값                                            | 설명                             |
| --------------------------- | --------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_BACKEND_URL`   | `https://meet-middle-backend.onrender.com`    | 백엔드 API URL (Render 배포 URL) |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 카카오 개발자 콘솔에서 발급받은 JavaScript 키 | 카카오맵 API 키                  |

#### 환경 변수 설정 방법

1. **Vercel 대시보드** → 프로젝트 선택
2. **Settings** → **Environment Variables** 클릭
3. **Add New** 버튼 클릭
4. 각 환경 변수를 추가:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://meet-middle-backend.onrender.com`
   - **Environment**: Production, Preview, Development 모두 선택 ✅
5. 동일하게 `NEXT_PUBLIC_KAKAO_MAP_KEY`도 추가

#### 주의사항

- `NEXT_PUBLIC_` 접두사가 붙은 환경 변수만 클라이언트 사이드에서 접근 가능합니다
- 환경 변수를 추가한 후 **반드시 재배포**해야 적용됩니다
- Production, Preview, Development 환경에 각각 설정 가능합니다

### 2.3. 배포 설정 (Optional)

**Settings** → **General**에서 다음 설정을 확인:

- **Node.js Version**: 18.x 이상 권장
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)

---

## 3. 백엔드 설정 (Render)

### 3.1. CORS 설정 확인

백엔드에서 Vercel 도메인을 허용해야 합니다.

#### Render 백엔드 환경 변수 확인

Render 대시보드 → 백엔드 서비스 → **Environment** 탭에서 다음을 확인:

```env
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://your-vercel-app.vercel.app
```

또는 여러 도메인을 허용하려면:

```env
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://your-custom-domain.com,http://localhost:3000
```

#### 백엔드 코드에서 CORS 설정 확인

백엔드 코드에서 다음과 같이 설정되어 있어야 합니다:

```typescript
// 예시 (백엔드 프레임워크에 따라 다름)
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
  credentials: true, // 쿠키 전송 허용
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

### 3.2. 카카오 로그인 리다이렉트 URL 설정

백엔드에서 카카오 로그인 후 리다이렉트할 프론트엔드 URL을 설정해야 합니다.

#### Render 백엔드 환경 변수

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
```

또는 여러 도메인을 허용하려면:

```env
FRONTEND_URL=https://your-vercel-app.vercel.app,https://your-custom-domain.com,http://localhost:3000
```

#### 백엔드 코드에서 리다이렉트 URL 설정 확인

카카오 로그인 성공 후 다음과 같이 리다이렉트되어야 합니다:

```typescript
// 예시
const frontendUrl = process.env.FRONTEND_URL?.split(",")[0] || "http://localhost:3000";
res.redirect(`${frontendUrl}?login=success`);
```

### 3.3. 쿠키 설정 확인 (중요!)

백엔드에서 쿠키 설정이 Cross-Origin을 지원해야 합니다.

#### 백엔드 쿠키 설정 예시

```typescript
// 쿠키 설정 시
res.cookie("refresh_token", token, {
  httpOnly: true,
  secure: true, // HTTPS에서만 전송
  sameSite: "none", // Cross-Origin 허용
  domain: undefined, // 도메인 명시하지 않음
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
});
```

**중요**: `sameSite: 'none'`과 `secure: true`가 함께 설정되어 있어야 Cross-Origin 쿠키가 작동합니다.

---

## 4. 카카오 개발자 콘솔 설정

### 4.1. 카카오 로그인 리다이렉트 URI 등록

1. **카카오 개발자 콘솔** 접속

   - https://developers.kakao.com 접속
   - 애플리케이션 선택

2. **카카오 로그인** → **Redirect URI** 설정

   - **플랫폼**: Web
   - **Redirect URI 추가**:

     ```
     https://your-vercel-app.vercel.app/auth/kakao/callback
     ```

     (백엔드가 카카오 콜백을 처리하는 경우)

     또는 백엔드 URL이 직접 처리한다면:

     ```
     https://meet-middle-backend.onrender.com/api/auth/kakao/callback
     ```

3. **저장** 버튼 클릭

### 4.2. 카카오맵 JavaScript SDK 도메인 등록

1. **카카오 개발자 콘솔** → **앱 설정** → **플랫폼**
2. **Web 플랫폼 등록** 클릭
3. **사이트 도메인**에 Vercel 도메인 추가:

   ```
   your-vercel-app.vercel.app
   ```

   또는 커스텀 도메인이 있다면:

   ```
   your-custom-domain.com
   ```

4. **JavaScript SDK 도메인**에도 동일하게 추가
5. **저장** 버튼 클릭

### 4.3. 카카오 로그인 설정 확인

1. **카카오 로그인** → **활성화 상태**: ON
2. **동의항목** 설정 확인:
   - 필수: 닉네임, 프로필 사진
   - 선택: 이메일 등

---

## 5. 배포 후 확인 사항

### 5.1. 기본 기능 확인

- [ ] 페이지가 정상적으로 로드되는지 확인
- [ ] 헤더의 로고가 표시되는지 확인
- [ ] 반응형 디자인이 작동하는지 확인 (모바일/태블릿/데스크탑)

### 5.2. API 연동 확인

- [ ] 장소 검색 기능 작동 확인
- [ ] 추천 기능 작동 확인
- [ ] 로그인/로그아웃 작동 확인
- [ ] 기록 페이지 작동 확인
- [ ] 즐겨찾기 페이지 작동 확인

### 5.3. 카카오맵 확인

- [ ] 지도가 정상적으로 로드되는지 확인
- [ ] 마커가 정상적으로 표시되는지 확인
- [ ] 지도 인터랙션이 작동하는지 확인

### 5.4. 인증 확인

- [ ] 카카오 로그인이 정상적으로 작동하는지 확인
- [ ] 로그인 후 세션이 유지되는지 확인
- [ ] 로그아웃 후 세션이 제거되는지 확인
- [ ] 토큰 자동 갱신이 작동하는지 확인

### 5.5. CORS 및 쿠키 확인

브라우저 개발자 도구(F12) → **Network** 탭에서:

- [ ] API 요청이 `withCredentials: true`로 전송되는지 확인
- [ ] 응답 헤더에 `Set-Cookie`가 포함되는지 확인
- [ ] CORS 에러가 없는지 확인

### 5.6. 콘솔 에러 확인

브라우저 개발자 도구(F12) → **Console** 탭에서:

- [ ] 에러가 없는지 확인
- [ ] 경고 메시지 확인 및 필요시 수정

---

## 6. 문제 해결

### 6.1. 빌드 실패

**증상**: Vercel 배포 시 빌드 에러 발생

**해결 방법**:

1. 로컬에서 `npm run build` 실행하여 에러 확인
2. TypeScript 타입 에러 확인
3. 의존성 문제 확인 (`package.json`, `package-lock.json`)
4. Node.js 버전 확인 (Vercel 설정에서 18.x 이상 권장)

### 6.2. 환경 변수 미적용

**증상**: 환경 변수가 클라이언트에서 `undefined`로 표시됨

**해결 방법**:

1. Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
2. 환경 변수 이름에 `NEXT_PUBLIC_` 접두사가 있는지 확인
3. 환경 변수를 추가한 후 **재배포** 실행
4. 브라우저 캐시 삭제 후 새로고침

### 6.3. CORS 에러

**증상**: 브라우저 콘솔에 CORS 관련 에러 표시

**해결 방법**:

1. 백엔드(Render)에서 CORS 설정 확인
2. `CORS_ORIGIN` 환경 변수에 Vercel 도메인이 포함되어 있는지 확인
3. 백엔드 코드에서 `credentials: true` 설정 확인
4. 백엔드 서비스 재시작

### 6.4. 쿠키가 전송되지 않음

**증상**: 로그인 후 세션이 유지되지 않음

**해결 방법**:

1. 백엔드 쿠키 설정 확인:
   - `sameSite: 'none'` 설정
   - `secure: true` 설정 (HTTPS에서만 작동)
2. 프론트엔드에서 `withCredentials: true` 설정 확인 (`apiClient.ts`)
3. 브라우저 개발자 도구 → Application → Cookies에서 쿠키 확인
4. 브라우저 쿠키 설정에서 서드파티 쿠키 차단 해제 확인

### 6.5. 카카오맵이 로드되지 않음

**증상**: 지도가 표시되지 않고 "지도를 불러오는 중..."에서 멈춤

**해결 방법**:

1. `NEXT_PUBLIC_KAKAO_MAP_KEY` 환경 변수가 올바르게 설정되었는지 확인
2. 카카오 개발자 콘솔에서 JavaScript SDK 도메인에 Vercel 도메인이 등록되어 있는지 확인
3. 브라우저 콘솔에서 카카오맵 API 관련 에러 확인
4. 카카오맵 API 사용량 제한 확인

### 6.6. 카카오 로그인 실패

**증상**: 카카오 로그인 후 리다이렉트되지 않거나 에러 발생

**해결 방법**:

1. 카카오 개발자 콘솔에서 Redirect URI 설정 확인
2. 백엔드 `FRONTEND_URL` 환경 변수에 Vercel 도메인이 포함되어 있는지 확인
3. 백엔드 카카오 로그인 콜백 핸들러 확인
4. 네트워크 탭에서 카카오 로그인 요청/응답 확인

### 6.7. API 요청 401 에러

**증상**: 로그인 후에도 API 요청이 401 에러 발생

**해결 방법**:

1. 토큰이 localStorage에 저장되는지 확인
2. 요청 헤더에 `Authorization: Bearer {token}`이 포함되는지 확인
3. 백엔드 토큰 검증 로직 확인
4. 토큰 자동 갱신 로직 확인 (`apiClient.ts`)

---

## 7. 배포 워크플로우

### 7.1. 초기 배포

1. **GitHub에 코드 푸시**

   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Vercel에서 프로젝트 Import**

   - Vercel 대시보드 → Add New → Project
   - GitHub 저장소 선택
   - 환경 변수 설정
   - Deploy 클릭

3. **배포 완료 확인**
   - 배포 로그 확인
   - 배포된 URL 접속하여 테스트

### 7.2. 지속적인 배포 (CI/CD)

Vercel은 GitHub와 연동되어 자동으로 배포됩니다:

- **main 브랜치에 푸시** → Production 배포
- **다른 브랜치에 푸시** → Preview 배포
- **Pull Request 생성** → Preview 배포

---

## 8. 추가 리소스

### Vercel 공식 문서

- [Next.js 배포 가이드](https://vercel.com/docs/frameworks/nextjs)
- [환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)
- [도메인 설정](https://vercel.com/docs/concepts/projects/domains)

### Next.js 공식 문서

- [배포 가이드](https://nextjs.org/docs/deployment)
- [환경 변수](https://nextjs.org/docs/basic-features/environment-variables)

---

## 9. 체크리스트 요약

배포 전 최종 체크리스트:

### Vercel 설정

- [ ] 프로젝트 생성 완료
- [ ] 환경 변수 `NEXT_PUBLIC_BACKEND_URL` 설정
- [ ] 환경 변수 `NEXT_PUBLIC_KAKAO_MAP_KEY` 설정
- [ ] 빌드 성공 확인

### 백엔드 설정 (Render)

- [ ] CORS 설정에 Vercel 도메인 추가
- [ ] `FRONTEND_URL` 환경 변수에 Vercel 도메인 추가
- [ ] 쿠키 설정 (`sameSite: 'none'`, `secure: true`) 확인
- [ ] 백엔드 서비스 재시작

### 카카오 개발자 콘솔

- [ ] Redirect URI에 Vercel 도메인 추가
- [ ] JavaScript SDK 도메인에 Vercel 도메인 추가
- [ ] 카카오 로그인 활성화 확인

### 배포 후 테스트

- [ ] 기본 페이지 로드 확인
- [ ] 로그인/로그아웃 작동 확인
- [ ] API 연동 확인
- [ ] 카카오맵 작동 확인
- [ ] CORS 및 쿠키 확인

---

이 가이드를 따라하시면 Vercel 배포가 성공적으로 완료됩니다! 🎉
