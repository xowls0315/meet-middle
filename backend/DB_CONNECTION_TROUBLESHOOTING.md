# 데이터베이스 연결 문제 해결 가이드

## 🔍 문제 진단

### 에러 메시지 분석

#### 1. `Error: read ECONNRESET`
- **의미**: 데이터베이스 서버가 연결을 강제로 종료함
- **원인**: 
  - SSL/TLS 설정 누락
  - 방화벽 차단
  - 잘못된 연결 정보

#### 2. `error: SSL/TLS required`
- **의미**: 데이터베이스 서버가 SSL 연결을 요구함
- **원인**: 클라우드 데이터베이스는 대부분 SSL 필수

---

## ✅ 해결 방법

### 1. SSL 설정 추가 (이미 적용됨)

코드에서 자동으로 SSL을 감지하고 설정합니다:
- 클라우드 DB URL 감지 (render.com, neon.tech, supabase.co 등)
- 프로덕션 환경에서 자동 활성화
- `DB_SSL=true` 환경변수로 강제 활성화 가능

### 2. 환경 변수 설정

#### 로컬 개발 환경
```env
# 로컬 PostgreSQL (SSL 불필요)
DB_URL=postgresql://postgres:password@localhost:5432/meet_middle
DB_SSL=false
```

#### 클라우드 데이터베이스 (Neon, Supabase, Render 등)
```env
# SSL 필수
DB_URL=postgresql://user:password@host:port/database
DB_SSL=true
```

---

## 🛠️ 문제별 해결 방법

### 문제 1: SSL/TLS required 에러

**증상**:
```
error: SSL/TLS required
```

**해결**:
1. `.env` 파일에 `DB_SSL=true` 추가
2. 또는 프로덕션 환경에서는 자동으로 활성화됨

### 문제 2: ECONNRESET 에러

**증상**:
```
Error: read ECONNRESET
```

**해결**:
1. 데이터베이스 서버가 실행 중인지 확인
2. 연결 정보(호스트, 포트, 사용자명, 비밀번호) 확인
3. 방화벽 설정 확인 (클라우드 DB의 경우)

### 문제 3: 연결 타임아웃

**증상**:
```
TimeoutError: Connection timeout
```

**해결**:
1. 네트워크 연결 확인
2. 데이터베이스 호스트 주소 확인
3. 방화벽/보안 그룹 설정 확인

---

## 📋 체크리스트

### 로컬 개발 환경
- [ ] PostgreSQL 서버 실행 중
- [ ] `DB_URL` 형식이 올바른지 확인
- [ ] 사용자명/비밀번호가 정확한지 확인
- [ ] 데이터베이스가 생성되었는지 확인
- [ ] 포트가 5432인지 확인 (기본값)

### 클라우드 데이터베이스
- [ ] `DB_URL`이 External Database URL인지 확인
- [ ] `DB_SSL=true` 설정 (또는 프로덕션 환경)
- [ ] 방화벽/보안 그룹에서 IP 허용 확인
- [ ] 데이터베이스 서비스가 실행 중인지 확인

---

## 🔧 자동 SSL 감지 로직

코드는 다음 조건에서 자동으로 SSL을 활성화합니다:

1. **프로덕션 환경**: `NODE_ENV=production`
2. **명시적 설정**: `DB_SSL=true`
3. **클라우드 DB 감지**: URL에 다음 문자열 포함
   - `render.com`
   - `neon.tech`
   - `supabase.co`
   - `railway.app`
   - `herokuapp.com`

---

## 📝 DB_URL 형식 예시

### 로컬 PostgreSQL
```
postgresql://postgres:password@localhost:5432/meet_middle
```

### Render PostgreSQL
```
postgresql://user:password@dpg-xxxxx-a.singapore-postgres.render.com/meet_middle
```

### Neon PostgreSQL
```
postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb
```

### Supabase PostgreSQL
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

---

## 🚨 주의사항

1. **로컬 개발**: 로컬 PostgreSQL은 SSL이 필요 없으므로 `DB_SSL=false` 설정
2. **클라우드 DB**: 반드시 SSL 활성화 필요
3. **보안**: `rejectUnauthorized: false`는 개발용이며, 프로덕션에서는 인증서 검증 권장

---

## 💡 추가 디버깅

### 연결 테스트
```bash
# psql로 직접 연결 테스트
psql "postgresql://user:password@host:port/database?sslmode=require"
```

### TypeORM 로깅 활성화
`.env` 파일에 추가:
```env
NODE_ENV=development
```
이렇게 하면 SQL 쿼리가 로그에 출력됩니다.

