# 프론트엔드 Share API 수정 가이드

## 📋 개요

백엔드 Share API 응답에서 `user.name` → `user.nickname`으로 변경되었습니다. 프론트엔드에서 해당 필드를 사용하는 부분을 수정해야 합니다.

---

## 🔧 수정 필요 사항

### 1. API 응답 타입 정의 수정

**변경 전:**
```typescript
interface ShareResponse {
  anchor: { lat: number; lng: number };
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl?: string;
    distance?: number;
  };
  candidates?: Array<{...}>;
  participants?: Array<{...}>;
  user?: {
    name: string;  // ❌ 변경 필요
  };
}
```

**변경 후:**
```typescript
interface ShareResponse {
  anchor: { lat: number; lng: number };
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl?: string;
    distance?: number;
  };
  candidates?: Array<{...}>;
  participants?: Array<{...}>;
  user?: {
    nickname: string;  // ✅ nickname으로 변경
  };
}
```

---

### 2. 공유 메시지 표시 로직 수정

**변경 전:**
```typescript
// 공유 페이지 컴포넌트
function SharePage() {
  const [shareData, setShareData] = useState<ShareResponse | null>(null);

  useEffect(() => {
    // GET /api/share/:id 호출
    fetchShareData(shareId).then(setShareData);
  }, [shareId]);

  // ❌ 변경 전
  const shareMessage = shareData?.user?.name
    ? `${shareData.user.name}님이 공유한 만남 장소 추천입니다`
    : "다른 사람이 공유한 만남 장소 추천입니다";

  return (
    <div>
      <p>{shareMessage}</p>
      {/* ... */}
    </div>
  );
}
```

**변경 후:**
```typescript
// 공유 페이지 컴포넌트
function SharePage() {
  const [shareData, setShareData] = useState<ShareResponse | null>(null);

  useEffect(() => {
    // GET /api/share/:id 호출
    fetchShareData(shareId).then(setShareData);
  }, [shareId]);

  // ✅ 변경 후: user.name → user.nickname
  const shareMessage = shareData?.user?.nickname
    ? `${shareData.user.nickname}님이 공유한 만남 장소 추천입니다`
    : "다른 사람이 공유한 만남 장소 추천입니다";

  return (
    <div>
      <p>{shareMessage}</p>
      {/* ... */}
    </div>
  );
}
```

---

### 3. API 호출 함수 수정 (타입 정의 사용 시)

```typescript
// API 호출 함수 예시
async function fetchShareData(shareId: string): Promise<ShareResponse> {
  const response = await fetch(`${BACKEND_URL}/api/share/${shareId}`);
  if (!response.ok) {
    throw new Error('공유 링크를 찾을 수 없습니다.');
  }
  const data: ShareResponse = await response.json();
  
  // ✅ user.nickname 필드 확인
  // data.user?.nickname 으로 접근 가능
  
  return data;
}
```

---

## 📝 체크리스트

프론트엔드 수정 시 확인할 사항:

- [ ] `ShareResponse` 타입 정의에서 `user.name` → `user.nickname`으로 변경
- [ ] 공유 메시지 표시 로직에서 `user.name` → `user.nickname`으로 변경
- [ ] 공유 페이지 컴포넌트에서 `shareData.user?.name` → `shareData.user?.nickname`으로 변경
- [ ] 기타 `user.name`을 참조하는 모든 코드 수정

---

## 🎯 예상 동작

### 로그인한 사용자가 공유한 경우
```json
{
  "anchor": {...},
  "final": {...},
  "user": {
    "nickname": "홍길동"
  }
}
```
**프론트엔드 표시:** "홍길동님이 공유한 만남 장소 추천입니다"

### 게스트가 공유한 경우
```json
{
  "anchor": {...},
  "final": {...}
  // user 필드 없음
}
```
**프론트엔드 표시:** "다른 사람이 공유한 만남 장소 추천입니다"

---

## ⚠️ 주의사항

1. **옵셔널 체이닝 필수**: `user` 필드는 선택적이므로 `shareData?.user?.nickname` 형태로 접근해야 합니다.
2. **하위 호환성**: 기존 Share 링크는 `user` 필드가 없을 수 있으므로, 항상 존재 여부를 확인해야 합니다.
3. **타입 안정성**: TypeScript를 사용하는 경우 타입 정의를 반드시 수정해야 합니다.

---

이 가이드를 참고하여 프론트엔드 코드를 수정하세요.

