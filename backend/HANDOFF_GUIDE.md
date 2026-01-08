# 백엔드 → 프론트엔드 개발자 전달 가이드

## 📦 전달할 내용

프론트엔드 개발자에게 다음을 전달하세요:

### 1. 배포 서버 정보

**Render 배포 URL:**
```
https://your-backend-service.onrender.com
```

**Swagger UI URL:**
```
https://your-backend-service.onrender.com/api-docs
```

### 2. 문서 파일

다음 문서 파일들을 전달하세요:

1. **`FRONTEND_TESTING_GUIDE.md`** ⭐ (가장 중요)
   - API 테스트 가이드
   - Swagger UI 사용법
   - 모든 엔드포인트 설명

2. **`FRONTEND_DEPLOYMENT_GUIDE.md`**
   - 프로덕션 배포 서버 테스트 가이드
   - 배포 환경에서의 주의사항

3. **`SWAGGER_AUTH_GUIDE.md`**
   - Swagger UI 인증 설정 가이드
   - JWT 토큰 사용법

4. **`SWAGGER_TROUBLESHOOTING.md`**
   - Swagger UI 문제 해결 가이드

### 3. 환경 변수 정보

프론트엔드 개발자에게 다음 환경 변수를 설정하도록 안내:

```env
# React
REACT_APP_BACKEND_URL=https://your-backend-service.onrender.com

# Next.js
NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.onrender.com

# Vite
VITE_BACKEND_URL=https://your-backend-service.onrender.com
```

---

## ✅ 배포 전 확인사항

### 백엔드 개발자가 확인할 사항

- [ ] Render 배포 완료
- [ ] 모든 환경 변수 설정 완료
- [ ] `BACKEND_URL`이 실제 배포 URL로 설정됨
- [ ] `FRONTEND_URL`이 실제 프론트엔드 URL로 설정됨
- [ ] 카카오 개발자 콘솔에 프로덕션 Redirect URI 등록
- [ ] 카카오 개발자 콘솔에 로그아웃 리다이렉트 URI 등록
- [ ] Swagger UI 접속 확인
- [ ] 헬스 체크 응답 확인

### 프론트엔드 개발자에게 전달할 정보

- [ ] Render 배포 URL
- [ ] Swagger UI URL
- [ ] 모든 문서 파일
- [ ] 환경 변수 설정 가이드

---

## 🚀 빠른 시작 가이드 (프론트엔드 개발자용)

### 1단계: Swagger UI 접속

```
https://your-backend-service.onrender.com/api-docs
```

### 2단계: 헬스 체크 확인

Swagger UI에서 `GET /health` 호출하여 서버 상태 확인

### 3단계: 카카오 로그인 테스트

브라우저에서:
```
https://your-backend-service.onrender.com/api/auth/kakao
```

### 4단계: API 테스트

Swagger UI에서:
1. **Authorize** 버튼 클릭
2. JWT 토큰 입력 (Bearer 제외)
3. API 호출 테스트

---

## 📞 문의사항

프론트엔드 개발자가 문의할 수 있는 내용:
- CORS 에러
- 카카오 로그인 실패
- API 응답 형식
- 에러 처리 방법

---

이 가이드를 참고하여 프론트엔드 개발자에게 백엔드를 전달하세요! 🚀

