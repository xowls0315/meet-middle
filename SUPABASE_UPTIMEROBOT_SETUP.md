# Supabase + UptimeRobot 무료 배포 가이드 (Meet-Middle)

Render PostgreSQL 무료 플랜의 **기간 제한(만료)** 과 **Web Service 15분 sleep**을 피하기 위해,  
**Supabase(DB)** + **Render(Web Service)** + **UptimeRobot(5분 핑)** 조합으로 전환하는 과정을 단계별로 정리했습니다.  
**결제 없이** 무료 플랜만 사용합니다.

---

## 전체 흐름 요약

| 순서 | 작업 | 목적 |
|------|------|------|
| 1 | Supabase 프로젝트 생성 | 무료 PostgreSQL DB 확보 (만료 없음) |
| 2 | Supabase DB 연결 정보 확인 | 백엔드 환경변수 입력용 |
| 3 | DBeaver로 Supabase DB 연결 후 `final.sql` 실행 | 테이블 생성 (users, shares, meetings, favorites) |
| 4 | Render Web Service 환경변수를 Supabase 값으로 변경 | 백엔드가 Supabase DB 사용 |
| 5 | UptimeRobot 모니터 등록 (5분 간격) | Render sleep 방지 + Supabase 7일 pause 방지 |
| 6 | 배포 확인 및 동작 테스트 | API·DB 정상 여부 확인 |

---

## 1단계: Supabase 프로젝트 생성

1. **가입 및 로그인**
   - https://supabase.com 접속 후 **Start your project** 클릭.
   - GitHub, Google 등으로 로그인.

2. **New Project 생성**
   - **New project** 클릭.
   - **Organization**: 기존 조직 또는 새로 생성.
   - **Name**: 예) `meet-middle`
   - **Database Password**: **강한 비밀번호를 생성한 뒤 반드시 안전한 곳에 저장**합니다.  
     (한 번만 표시되며, 잃어버리면 재설정이 필요합니다.)
   - **Region**: `Northeast Asia (Seoul)` 또는 가까운 리전 선택.
   - **Pricing Plan**: **Free** 선택.
   - **Create new project** 클릭 후 DB 생성 완료될 때까지 1~2분 대기.

3. **무료 플랜 참고**
   - DB 용량 500MB.
   - **7일 연속 미사용** 시 프로젝트가 일시정지(pause)될 수 있음.
   - UptimeRobot으로 백엔드 URL을 5분마다 호출하면, 백엔드가 DB를 사용하게 되어 pause를 피할 수 있습니다.

---

## 2단계: Supabase DB 연결 정보 확인

1. Supabase 대시보드에서 방금 만든 **프로젝트** 선택.

2. 왼쪽 메뉴 **Project Settings** (휴지통 아이콘 아래 **톱니바퀴**) 클릭.

3. **Database** 탭 선택.

4. 아래 항목을 메모합니다. (나중에 Render 환경변수와 DBeaver 연결에 사용)

   | 항목 | 값 |
   |------|-----|
   | **Host** | `db.xxxxxxxxxxxxx.supabase.co` (프로젝트별로 다름) |
   | **Port** | `5432` (**Direct connection** 기준) |
   | **Database name** | `postgres` |
   | **User** | `postgres` |
   | **Password** | 프로젝트 생성 시 저장한 DB 비밀번호 |

5. **Connection string** (참고용)
   - **URI** 탭에서 **Direct connection** 문자열을 복사할 수 있습니다.
   - 형식: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Meet-Middle 백엔드는 `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` 를 개별로 사용하므로, 위 표의 값을 각각 넣으면 됩니다.

6. **SSL**
   - Supabase는 기본적으로 **SSL 필수**입니다.
   - Render 환경변수에 **`DB_SSL=true`** 를 반드시 설정합니다.

---

## 3단계: DBeaver로 Supabase DB 연결 후 스키마 적용

### 3-1. DBeaver에서 새 연결 생성

1. **DBeaver** 실행 → **새 연결** (또는 Database → New Database Connection) → **PostgreSQL** 선택.

2. **연결 설정**
   - **Host**: 2단계에서 확인한 Host (예: `db.xxxxxxxxxxxxx.supabase.co`)
   - **Port**: `5432`
   - **Database**: `postgres`
   - **Username**: `postgres`
   - **Password**: DB 비밀번호

3. **SSL 설정**
   - **SSL** 탭 이동.
   - **Use SSL** 체크.
   - Supabase는 기본 SSL을 사용하므로, **Allow self-signed certificate** 등 필요 시 체크 후 **Test Connection** 실행.

4. **Test Connection** 성공 후 **Finish**로 저장.

### 3-2. 스키마(테이블) 적용

1. **스키마 사용 방식 선택**
   - **방법 A – 기본 스키마 `public` 사용 (권장)**  
     - `backend/database/final.sql` 파일을 그대로 실행합니다.  
     - 별도 `CREATE SCHEMA` 없이 실행하면 모든 테이블이 `public` 스키마에 생성됩니다.  
     - 이후 Render 환경변수에서 **`DB_SCHEMA=public`** 로 두면 됩니다.

   - **방법 B – 별도 스키마 `meet-middle` 사용**  
     - DBeaver에서 해당 Supabase 연결에 대해 **SQL Editor**를 열고, 아래를 **먼저** 실행합니다.
     ```sql
     CREATE SCHEMA IF NOT EXISTS "meet-middle";
     SET search_path TO "meet-middle";
     ```
     - 그 다음 `backend/database/final.sql` **전체 내용**을 붙여넣어 실행합니다.  
     - Render 환경변수에서 **`DB_SCHEMA=meet-middle`** 로 설정합니다.

2. **실행 방법**
   - **DBeaver**: Supabase 연결 선택 → 우클릭 → **SQL Editor** → **New SQL Script** → `final.sql` 내용 붙여넣기 → 실행 (Ctrl+Enter).
   - 또는 **Supabase 대시보드**: **SQL Editor** 메뉴에서 동일한 SQL 실행.

3. **확인**
   - DBeaver 또는 Supabase **Table Editor**에서 `users`, `shares`, `meetings`, `favorites` 테이블이 보이면 성공입니다.

---

## 4단계: Render Web Service 환경변수를 Supabase로 변경

1. **Render 대시보드** (https://dashboard.render.com) 로그인.

2. Meet-Middle **Web Service** (백엔드 서비스) 선택.

3. **Environment** 탭으로 이동.

4. **DB 관련 환경변수**를 아래처럼 Supabase 값으로 **수정 또는 추가**합니다.

   | Key | 값 |
   |-----|-----|
   | `DB_HOST` | `db.xxxxxxxxxxxxx.supabase.co` (2단계에서 확인한 Host) |
   | `DB_PORT` | `5432` |
   | `DB_USERNAME` | `postgres` |
   | `DB_PASSWORD` | (Supabase DB 비밀번호) |
   | `DB_DATABASE` | `postgres` |
   | `DB_SCHEMA` | `public` (방법 A) 또는 `meet-middle` (방법 B) |
   | `DB_SSL` | `true` |

5. **기존 Render PostgreSQL** 관련 변수가 있다면 위 값으로 덮어쓰거나, 더 이상 사용하지 않으면 제거해도 됩니다.

6. **Save Changes** 후 **Manual Deploy** → **Deploy latest commit** (또는 푸시 시 자동 배포되면 그대로 두고 배포 완료 대기).

7. 배포가 끝나면 **Logs** 탭에서 앱이 정상 기동하는지, DB 연결 에러가 없는지 확인합니다.

---

## 5단계: UptimeRobot 설정 (5분마다 핑)

1. **가입**
   - https://uptimerobot.com 접속 후 **Sign Up Free**로 무료 계정 생성.

2. **모니터 추가**
   - **+ Add New Monitor** 클릭.

3. **모니터 설정**
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: 예) `Meet-Middle Backend`
   - **URL**:
     - Render Web Service 주소 + **헬스 체크 경로**
     - 예: `https://meet-middle-backend-pdur.onrender.com/health`
     - (실제 백엔드 URL이 다르면 해당 URL로 변경)
   - **Monitoring Interval**: **5 minutes** 선택.

4. **Create Monitor**로 저장.

5. **동작**
   - 5분마다 UptimeRobot이 위 URL로 HTTP 요청을 보냅니다.
   - Render 무료 Web Service는 일정 시간(약 15분) 비활성 시 sleep 되는데, 5분마다 요청이 들어오면 **sleep 해제**되거나 깨어 있는 상태를 유지합니다.
   - 해당 요청이 백엔드를 거치면서 DB 연결 등이 이루어지므로, Supabase도 “활동 있음”으로 인식해 **7일 pause**를 피하는 데 도움이 됩니다.

---

## 6단계: 배포 및 동작 확인

1. **헬스 체크**
   - 브라우저 또는 curl: `https://meet-middle-backend-pdur.onrender.com/health`
   - 예상 응답: `{ "status": "ok", "timestamp": "..." }`

2. **API 문서**
   - `https://meet-middle-backend-pdur.onrender.com/api-docs` 로 접속해 Swagger UI가 뜨는지 확인.

3. **DB 연동 확인**
   - 프론트엔드에서 로그인, 추천 받기, 공유 링크 생성 등 실제 기능이 동작하는지 확인.

4. **UptimeRobot**
   - 몇 분 후 UptimeRobot 대시보드에서 해당 모니터 상태가 **Up**으로 표시되는지 확인.

---

## 주의사항 및 트러블슈팅

- **Supabase 비밀번호**: 프로젝트 생성 시 한 번만 표시되므로 반드시 저장. 잃어버리면 **Project Settings → Database**에서 재설정 가능.
- **DB_SSL**: Supabase는 SSL 필수이므로 `DB_SSL=true` 없으면 연결 실패할 수 있습니다.
- **Render 750시간/월**: 무료 Web Service는 월 750시간 제한. 5분 핑으로 깨워 두면 한 달 기준 750시간 이내로 사용 가능합니다.
- **Supabase 7일 pause**: UptimeRobot이 `/health`를 5분마다 호출하면 백엔드가 DB를 사용하게 되어 pause를 피할 수 있습니다.  
  이미 일시정지된 경우 Supabase 대시보드 **Project Settings → General**에서 **Restore project**로 복구할 수 있습니다.
- **기존 Render PostgreSQL 데이터 이전**: 기존 Render DB에 중요한 데이터가 있다면, DBeaver로 Render DB에서 데이터를 export한 뒤 Supabase DB에 import하는 방식을 별도로 진행하면 됩니다.
- **카카오 로그인 등 기타 환경변수**: `BACKEND_URL`, `FRONTEND_URL`, `JWT_SECRET`, `KAKAO_CLIENT_ID` 등은 **그대로 유지**하고, DB 관련 변수만 Supabase 값으로 바꾸면 됩니다.

---

## 체크리스트

- [ ] Supabase 프로젝트 생성 및 DB 비밀번호 저장
- [ ] Supabase Database 설정에서 Host, Port, User, Database, Password 확인
- [ ] DBeaver로 Supabase 연결 (SSL 사용) 후 `backend/database/final.sql` 실행
- [ ] Render Web Service 환경변수 `DB_*` 를 Supabase 값으로 변경, `DB_SSL=true` 설정
- [ ] Render 재배포 후 Logs에서 DB 연결 성공 확인
- [ ] UptimeRobot에 `https://[백엔드-URL]/health` 5분 간격 모니터 추가
- [ ] `/health` 응답 및 API 문서·프론트 동작 확인

이 순서대로 진행하면 **결제 없이** Supabase + Render + UptimeRobot으로 DB 만료와 sleep 문제를 완화할 수 있습니다.
