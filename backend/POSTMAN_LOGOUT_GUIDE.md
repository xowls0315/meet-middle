# Postman에서 로그아웃 API 호출 가이드

## 📋 로그아웃 API 정보

- **Method**: `POST`
- **URL**: `http://localhost:3001/api/auth/logout`
- **인증**: 필요 (JWT Access Token)
- **인증 방식**: 
  - Authorization Bearer 헤더 (권장) ⭐
  - 또는 Cookie (`access_token`)

---

## 🔧 Postman 설정 방법

### 방법 1: Authorization Bearer 헤더 사용 (권장) ⭐

#### 1단계: Access Token 확인
브라우저 개발자 도구에서:
1. **F12** → **Application** 탭 (Chrome) 또는 **Storage** 탭 (Firefox)
2. **Cookies** → `http://localhost:3001`
3. `access_token` 값 복사

#### 2단계: Postman에서 요청 설정
1. **POST** 요청: `http://localhost:3001/api/auth/logout`
2. **Headers** 탭:
   - **Key**: `Authorization`
   - **Value**: `Bearer YOUR_ACCESS_TOKEN_HERE`
   
   예시:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### 3단계: 요청 전송
**Send** 버튼 클릭

---

### 방법 2: Cookie 자동 전송

#### 1단계: 로그인 먼저 수행
1. **GET** 요청: `http://localhost:3001/api/auth/kakao`
2. 브라우저에서 카카오 로그인 완료
3. Postman이 자동으로 쿠키를 저장

#### 2단계: 로그아웃 요청
1. **POST** 요청: `http://localhost:3001/api/auth/logout`
2. **Headers**: 없음 (쿠키 자동 전송)
3. **Settings** → **Cookies**: 쿠키가 자동으로 포함됨

---

### 방법 2: Cookie 수동 설정

#### 1단계: Access Token 확인
브라우저 개발자 도구에서:
1. **F12** → **Application** 탭 (Chrome) 또는 **Storage** 탭 (Firefox)
2. **Cookies** → `http://localhost:3001`
3. `access_token` 값 복사

#### 2단계: Postman에서 Cookie 설정
1. **POST** 요청: `http://localhost:3001/api/auth/logout`
2. **Headers** 탭에서:
   - **Key**: `Cookie`
   - **Value**: `access_token=YOUR_ACCESS_TOKEN_HERE`
   
   예시:
   ```
   Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### 방법 3: Postman Cookie Manager 사용 (가장 편리)

#### 1단계: Cookie Manager 열기
1. Postman 상단 메뉴: **Send** 버튼 옆 **Cookies** 클릭
2. 또는 **View** → **Show Postman Console** → **Cookies** 탭

#### 2단계: Cookie 추가
1. **Add Cookie** 클릭
2. **Domain**: `localhost`
3. **Path**: `/`
4. **Name**: `access_token`
5. **Value**: Access Token 값 (브라우저에서 복사)
6. **Save**

#### 3단계: 로그아웃 요청
1. **POST** 요청: `http://localhost:3001/api/auth/logout`
2. Cookie가 자동으로 포함됨

---

## 📝 단계별 가이드

### 전체 플로우

#### 1. 로그인
```
GET http://localhost:3001/api/auth/kakao
```
- 브라우저에서 카카오 로그인 완료
- `access_token` 쿠키가 브라우저에 저장됨

#### 2. Postman에서 쿠키 가져오기
**옵션 A: Postman Interceptor 사용**
1. Postman 상단 **Intercept requests** 활성화
2. 브라우저에서 로그인
3. Postman이 자동으로 쿠키 캡처

**옵션 B: 수동으로 쿠키 복사**
1. 브라우저 개발자 도구에서 `access_token` 복사
2. Postman Cookie Manager에 추가

#### 3. 로그아웃
```
POST http://localhost:3001/api/auth/logout
```

**Headers**:
```
Cookie: access_token=YOUR_ACCESS_TOKEN
```

또는 Cookie Manager에 추가된 경우 자동으로 포함됨

---

## ✅ 예상 응답

### 성공 응답 (200 OK)
```json
{
  "message": "로그아웃 완료"
}
```

### 실패 응답 (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "인증이 필요합니다.",
  "error": "Unauthorized"
}
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 정상 로그아웃
1. 로그인 완료
2. Postman에서 `access_token` 쿠키 설정
3. `POST /api/auth/logout` 호출
4. **예상**: `{ "message": "로그아웃 완료" }`
5. 이후 `/api/auth/me` 호출 시 401 에러

### 시나리오 2: 인증 없이 로그아웃
1. 쿠키 없이 `POST /api/auth/logout` 호출
2. **예상**: `401 Unauthorized`

---

## 🔍 문제 해결

### 문제 1: 401 Unauthorized 에러
**원인**: `access_token` 쿠키가 없거나 만료됨

**해결**:
1. 브라우저에서 다시 로그인
2. 새로운 `access_token` 복사
3. Postman에 쿠키 다시 설정

### 문제 2: 쿠키가 전송되지 않음
**원인**: Postman 설정 문제

**해결**:
1. **Settings** → **General** → **Send cookies** 체크 확인
2. Cookie Manager에서 쿠키가 올바르게 설정되었는지 확인
3. Domain이 `localhost`인지 확인

### 문제 3: Access Token 만료
**원인**: Access Token은 15분 후 만료

**해결**:
1. `/api/auth/refresh`로 토큰 갱신
2. 또는 다시 로그인

---

## 💡 팁

### 1. Postman Environment 사용
환경 변수에 Access Token 저장:
```
ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Headers에서:
```
Cookie: access_token={{ACCESS_TOKEN}}
```

### 2. Pre-request Script 사용
자동으로 쿠키 설정:
```javascript
pm.request.headers.add({
  key: 'Cookie',
  value: `access_token=${pm.environment.get('ACCESS_TOKEN')}`
});
```

### 3. Collection 변수 사용
Collection 레벨에서 변수 설정하여 모든 요청에서 사용

---

## 📚 관련 API

### 로그인
```
GET http://localhost:3001/api/auth/kakao
```

### 현재 사용자 정보
```
GET http://localhost:3001/api/auth/me
```

### 토큰 갱신
```
POST http://localhost:3001/api/auth/refresh
```

### 로그아웃
```
POST http://localhost:3001/api/auth/logout
```

---

## ✅ 체크리스트

로그아웃 테스트:
- [ ] 로그인 완료
- [ ] `access_token` 쿠키 확인
- [ ] Postman에 쿠키 설정
- [ ] `POST /api/auth/logout` 호출
- [ ] `{ "message": "로그아웃 완료" }` 응답 확인
- [ ] 이후 `/api/auth/me` 호출 시 401 확인

