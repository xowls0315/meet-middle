# Render 배포 빌드 에러 해결 가이드

## 🚨 에러 내용

```
npm error ERESOLVE could not resolve
npm error While resolving: @nestjs/cache-manager@2.3.0
npm error Found: @nestjs/common@11.1.11
npm error Could not resolve dependency:
npm error peer @nestjs/common@"^9.0.0 || ^10.0.0" from @nestjs/cache-manager@2.3.0
```

## 🔍 원인

`@nestjs/cache-manager@2.3.0`이 NestJS 11과 호환되지 않는다고 표시되지만, 실제로는 정상 작동합니다. 이는 peer dependency 검증 문제입니다.

## ✅ 해결 방법

### Render Build Command 수정

Render 대시보드 → **Settings** → **Build Command**를 다음으로 변경:

```
npm install --legacy-peer-deps && npm run build
```

**기존 (에러 발생):**
```
npm ci && npm run build
```

**수정 후 (정상 작동):**
```
npm install --legacy-peer-deps && npm run build
```

---

## 📝 상세 설명

### `--legacy-peer-deps` 플래그란?

- npm 7+ 버전에서 엄격한 peer dependency 검증을 우회합니다.
- 호환되지 않는다고 표시되지만 실제로는 작동하는 패키지들을 설치할 수 있게 합니다.
- `@nestjs/cache-manager@2.3.0`은 NestJS 11에서도 정상 작동하지만, peer dependency 선언이 업데이트되지 않았습니다.

### 왜 이 방법을 사용하나요?

1. **`@nestjs/cache-manager` 업데이트 대기**: NestJS 11 호환 버전이 아직 출시되지 않았습니다.
2. **실제 작동 확인**: 로컬에서 이미 정상 작동하는 것을 확인했습니다.
3. **임시 해결책**: NestJS 팀이 공식 업데이트를 제공할 때까지 사용합니다.

---

## 🔄 Render 설정 변경 방법

### 1단계: Render 대시보드 접속

1. [Render 대시보드](https://dashboard.render.com/) 접속
2. 배포하려는 서비스 선택

### 2단계: Build Command 수정

1. **Settings** 탭 클릭
2. **Build Command** 섹션 찾기
3. 다음으로 변경:
   ```
   npm install --legacy-peer-deps && npm run build
   ```
4. **Save Changes** 클릭

### 3단계: 재배포

1. **Manual Deploy** → **Deploy latest commit** 클릭
2. 또는 새로운 커밋을 푸시하면 자동으로 재배포됩니다.

---

## ✅ 검증

배포 완료 후 다음을 확인:

1. **빌드 로그 확인**
   - `npm install --legacy-peer-deps` 성공
   - `npm run build` 성공

2. **서버 시작 확인**
   - 헬스 체크: `https://your-backend-service.onrender.com/health`
   - Swagger UI: `https://your-backend-service.onrender.com/api-docs`

---

## 📋 최종 Render 설정

### Build Command
```
npm install --legacy-peer-deps && npm run build
```

### Start Command
```
npm run start:prod
```

### Root Directory
```
backend
```


---

## ⚠️ 주의사항

1. **로컬 개발 환경**: 
   - 로컬에서는 `npm install --legacy-peer-deps`를 사용하지 않아도 됩니다.
   - 또는 `.npmrc` 파일에 `legacy-peer-deps=true` 추가 가능

2. **향후 업데이트**:
   - `@nestjs/cache-manager`가 NestJS 11 호환 버전을 출시하면 업데이트 권장
   - 그때까지는 `--legacy-peer-deps` 플래그 유지

---

## 🔧 대안 (권장하지 않음)

### 옵션 1: `.npmrc` 파일 생성

프로젝트 루트에 `.npmrc` 파일 생성:
```
legacy-peer-deps=true
```

하지만 Render에서는 Build Command에 직접 플래그를 추가하는 것이 더 명확합니다.

### 옵션 2: 패키지 버전 다운그레이드 (비권장)

NestJS 10으로 다운그레이드하는 것은 다른 패키지들과의 호환성 문제를 일으킬 수 있습니다.

---

이 가이드를 참고하여 Render 배포 빌드 에러를 해결하세요! 🚀

