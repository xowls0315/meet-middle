# 백엔드 API 연동 완료 가이드

## ✅ 완료된 작업

### 1. 라이브러리 설치
- ✅ `axios` 설치 완료

### 2. API 클라이언트 레이어 생성
- ✅ `lib/api/apiClient.ts` - axios 인스턴스 및 인터셉터 설정
- ✅ `lib/api/search.ts` - 장소 검색 API
- ✅ `lib/api/recommend.ts` - 추천 API
- ✅ `lib/api/share.ts` - 공유 API
- ✅ `lib/api/auth.ts` - 인증 API
- ✅ `lib/api/meetings.ts` - 약속 기록 API
- ✅ `lib/api/favorites.ts` - 즐겨찾기 API

### 3. 타입 정의 추가
- ✅ `types/index.ts`에 모든 API 요청/응답 타입 추가

### 4. 인증 관리 훅
- ✅ `hooks/useAuth.ts` - 로그인 상태 관리 훅

### 5. 컴포넌트 연동
- ✅ `components/ParticipantInput.tsx` - 검색 API 연동
- ✅ `components/Header.tsx` - 인증 API 연동
- ✅ `app/page.tsx` - 추천/공유/저장/즐겨찾기 API 연동
- ✅ `app/share/[id]/page.tsx` - 공유 조회 API 연동
- ✅ `app/history/page.tsx` - 기록 조회/삭제 API 연동
- ✅ `app/favorites/page.tsx` - 즐겨찾기 조회/삭제 API 연동

---

## 🔧 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API URL
NEXT_PUBLIC_BACKEND_URL=https://meet-middle-backend.onrender.com

# 로컬 개발 환경 (필요시 주석 해제)
# NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

⚠️ **중요**: `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다.

---

## 📋 주요 기능

### 1. 장소 검색 (자동완성)
- 최소 2글자 입력 시 자동완성
- 500ms 디바운스 적용
- Rate Limit 에러 처리

### 2. 중간 지점 추천
- 2~4명 참가자 좌표 기반 추천
- 에러 처리 및 로딩 상태 관리

### 3. 공유 링크
- 추천 결과 공유 링크 생성
- 클립보드 자동 복사

### 4. 인증
- 카카오 로그인
- 자동 토큰 갱신
- 로그아웃

### 5. 기록 관리 (로그인 필요)
- 약속 기록 저장/조회/삭제

### 6. 즐겨찾기 (로그인 필요)
- 즐겨찾기 추가/조회/삭제

---

## 🔐 인증 플로우

1. **로그인 시작**: `Header` 컴포넌트의 "로그인" 버튼 클릭
2. **카카오 로그인**: 백엔드 `/api/auth/kakao`로 리다이렉트
3. **콜백 처리**: `/api/auth/kakao/callback`에서 토큰 저장
4. **사용자 정보 로드**: `useAuth` 훅에서 자동으로 사용자 정보 조회
5. **토큰 관리**: localStorage에 Access Token 저장, 쿠키는 자동 관리

---

## ⚠️ 에러 처리

### Rate Limit (429)
- "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." 메시지 표시

### 인증 오류 (401)
- 자동으로 토큰 갱신 시도
- 실패 시 로그아웃 처리

### 네트워크 오류
- 사용자에게 친절한 에러 메시지 표시
- 콘솔에 상세 오류 로그 기록

---

## 🚀 다음 단계

1. **환경 변수 설정**: `.env.local` 파일 생성
2. **테스트**: 각 기능별로 API 연동 테스트
3. **에러 처리 개선**: 필요시 에러 메시지 커스터마이징
4. **로딩 상태 개선**: 스켈레톤 UI 및 로딩 인디케이터 확인

---

## 📝 참고 사항

- 모든 API 호출은 `lib/api/` 폴더의 함수를 통해 수행됩니다.
- 타입 안정성을 위해 `types/index.ts`의 타입을 사용합니다.
- 인증 상태는 `useAuth` 훅으로 관리됩니다.
- axios 인터셉터가 자동으로 토큰을 추가하고 에러를 처리합니다.

---

이제 백엔드 API와 완전히 연동되었습니다! 🎉
