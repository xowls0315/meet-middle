# 환경변수 설정 가이드

## 📋 필수 환경변수 목록

### 1. 서버 설정
- `PORT`: 서버 포트 (기본값: 3001)
- `NODE_ENV`: 환경 모드 (`development` | `production`)
- `BACKEND_URL`: 백엔드 URL (카카오 OAuth 콜백용)
- `FRONTEND_URL`: 프론트엔드 URL (CORS 설정용, 여러 개는 쉼표로 구분)

### 5. 쿠키 설정 (Cross-Origin 환경용)
- `COOKIE_DOMAIN`: 쿠키 도메인 (예: `.onrender.com`)
- `COOKIE_SAME_SITE`: SameSite 설정 (`lax` | `strict` | `none`)
- `COOKIE_SECURE`: HTTPS 전용 쿠키 (`true` | `false`)

### 2. 카카오 API 설정
- `KAKAO_REST_KEY`: 카카오 로컬 REST API 키
- `KAKAO_CLIENT_ID`: 카카오 OAuth 클라이언트 ID
- `KAKAO_CLIENT_SECRET`: 카카오 OAuth 클라이언트 시크릿

### 3. 인증 설정
- `JWT_SECRET`: JWT 토큰 시크릿 키

### 4. 데이터베이스 설정
- `DB_URL`: PostgreSQL 연결 URL

---

## 🚀 빠른 시작

### 1. .env 파일 생성
```bash
# backend 디렉토리에서
cp .env.example .env
```

### 2. 각 값 입력

#### 카카오 API 키 발급
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. **REST API 키** 복사 → `KAKAO_REST_KEY`에 입력
4. **REST API 키** 복사 → `KAKAO_CLIENT_ID`에 입력 (동일)
5. **카카오 로그인** → **보안** → **Client Secret** 생성 → `KAKAO_CLIENT_SECRET`에 입력

#### JWT Secret 생성
```bash
# Node.js로 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

또는 온라인 도구 사용: https://randomkeygen.com/

#### 데이터베이스 URL 설정
```bash
# 로컬 PostgreSQL 예시
DB_URL=postgresql://postgres:your_password@localhost:5432/meet_middle
```

---

## 📝 상세 설정 가이드

### 카카오 개발자 콘솔 설정

#### 1. 플랫폼 설정
- **Web 플랫폼** 등록
- 사이트 도메인: `http://localhost:3001` (개발) 또는 실제 도메인 (프로덕션)

#### 2. Redirect URI 설정
- **카카오 로그인** → **Redirect URI** 등록
- 개발: `http://localhost:3001/api/auth/kakao/callback`
- 프로덕션: `https://your-domain.com/api/auth/kakao/callback`

#### 3. 동의항목 설정
- **카카오 로그인** → **동의항목**
- 필수: 닉네임, 프로필 사진
- 선택: 이메일

---

## 🔒 보안 주의사항

### ⚠️ 절대 하지 말아야 할 것
1. ❌ `.env` 파일을 Git에 커밋
2. ❌ 환경변수를 코드에 하드코딩
3. ❌ 약한 JWT_SECRET 사용
4. ❌ 프로덕션 키를 개발 환경에 사용

### ✅ 해야 할 것
1. ✅ `.env` 파일을 `.gitignore`에 추가 (이미 포함됨)
2. ✅ `.env.example` 파일로 템플릿 제공
3. ✅ 프로덕션에서는 강력한 JWT_SECRET 사용 (최소 32자)
4. ✅ 환경별로 다른 키 사용

---

## 🌍 환경별 설정 예시

### 개발 환경 (.env.development)
```env
NODE_ENV=development
PORT=3001
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
DB_URL=postgresql://postgres:dev_password@localhost:5432/meet_middle_dev
```

### 프로덕션 환경 (.env.production)
```env
NODE_ENV=production
PORT=3001
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
DB_URL=postgresql://user:strong_password@db.example.com:5432/meet_middle

# Cross-Origin 쿠키 설정 (프론트엔드와 백엔드 도메인이 다를 때 필수)
COOKIE_DOMAIN=.onrender.com
# 프로덕션에서는 자동으로 sameSite=none, secure=true 적용됨
```

### Render 배포 환경 (Cross-Origin)
```env
NODE_ENV=production
PORT=3001
BACKEND_URL=https://meet-middle-backend.onrender.com
FRONTEND_URL=http://localhost:3000
# 여러 프론트엔드 도메인 허용 시:
# FRONTEND_URL=http://localhost:3000,https://your-frontend.vercel.app

# 쿠키 설정 (Cross-Origin 필수)
COOKIE_DOMAIN=.onrender.com

# 카카오 API
KAKAO_REST_KEY=your_rest_api_key
KAKAO_CLIENT_ID=your_rest_api_key
KAKAO_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_strong_jwt_secret

# 데이터베이스
DB_URL=your_database_url
```

---

## 🧪 환경변수 확인

### 서버 시작 시 확인
서버 시작 시 다음 메시지가 출력되면 정상:
```
Application is running on: http://localhost:3001
```

### 환경변수 누락 시
환경변수가 없으면 기본값이 사용되거나 에러가 발생합니다:
- `KAKAO_REST_KEY` 없음 → 카카오 API 호출 실패
- `JWT_SECRET` 없음 → 'secret' 기본값 사용 (프로덕션 위험!)
- `DB_URL` 없음 → 데이터베이스 연결 실패

---

## 📚 추가 리소스

- [카카오 개발자 문서](https://developers.kakao.com/docs)
- [카카오 로컬 API 가이드](https://developers.kakao.com/docs/latest/ko/local/dev-guide)
- [PostgreSQL 연결 문자열 형식](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

## ❓ 문제 해결

### 카카오 로그인 실패
- Redirect URI가 정확한지 확인
- Client Secret이 올바른지 확인
- 플랫폼 설정에서 Web 플랫폼이 등록되었는지 확인

### 데이터베이스 연결 실패
- PostgreSQL이 실행 중인지 확인
- 연결 URL 형식이 올바른지 확인
- 사용자명/비밀번호가 정확한지 확인

### JWT 토큰 오류
- JWT_SECRET이 설정되었는지 확인
- 토큰 만료 시간 확인 (Access: 15분, Refresh: 14일)

