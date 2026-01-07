# 카카오맵 설정 가이드

## 📋 카카오맵 JavaScript API 키 설정

카카오맵을 사용하기 위해서는 카카오맵 JavaScript API 키가 필요합니다.

### 1. 카카오 개발자 콘솔에서 키 발급

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. **내 애플리케이션** → 애플리케이션 추가하기 (또는 기존 애플리케이션 선택)
3. **앱 설정** 메뉴 클릭
4. **플랫폼** 섹션에서 **"JavaScript SDK 도메인"** 찾기 ⭐ 필수
   - 도메인 입력 필드에 `http://localhost:3000` 입력 (개발 환경)
   - `+` 버튼 클릭하여 추가
   - 프로덕션 도메인도 별도로 추가 필요
   - **⚠️ 중요**: 도메인을 등록하지 않으면 JavaScript 키를 사용할 수 없습니다!
5. **앱 키** 섹션에서 **JavaScript 키** 복사

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 추가:

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=발급받은_JavaScript_키
NEXT_PUBLIC_BACKEND_URL=https://meet-middle-backend.onrender.com
```

### 3. 확인 사항

- [ ] 카카오 개발자 콘솔에서 JavaScript 키 발급 완료
- [ ] `.env.local` 파일에 `NEXT_PUBLIC_KAKAO_MAP_KEY` 설정 완료
- [ ] 개발 서버 재시작 (`npm run dev`)
- [ ] 브라우저에서 카카오맵이 정상적으로 표시되는지 확인

---

**참고**: 카카오맵 JavaScript API는 무료로 사용 가능합니다.
