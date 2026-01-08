## 프론트엔드 변경사항 가이드 (Share + Recommend)

### 1. 개요

백엔드가 다음 기능을 지원하도록 변경되었습니다.

- **GET `/api/share/:id` 응답에 공유한 사용자 정보(`user`) 추가**
- **POST `/api/recommend` 요청에 선택적 카테고리 파라미터(`category`) 추가**

이 문서는 해당 변경 사항을 기반으로 프론트엔드에서 수정해야 할 부분을 정리한 가이드입니다.

---

## 2. Share 기능 변경사항

### 2.1 백엔드 응답 구조

`GET /api/share/:id` 응답 예시:

```json
{
  "anchor": { "lat": 37.5658, "lng": 126.9837 },
  "final": {
    "placeId": "8241891",
    "name": "강남역",
    "address": "서울특별시 강남구 강남대로 396",
    "lat": 37.4981,
    "lng": 127.0276,
    "placeUrl": "http://place.map.kakao.com/m/8241891"
  },
  "candidates": [
    // ...
  ],
  "participants": [
    { "label": "A", "lat": 37.5665, "lng": 126.9780 },
    { "label": "B", "lat": 37.5651, "lng": 126.9895 }
  ],
  "user": {
    "name": "홍길동"    // 로그인한 사용자가 공유한 경우에만 포함
  }
}
```

- **`user` 필드**
  - 로그인한 사용자가 공유 링크를 생성한 경우: `{ "name": "닉네임" }`
  - 게스트(비로그인) 공유인 경우: `user` 필드 **없음**

### 2.2 프론트엔드 타입 정의 예시

```typescript
interface ShareUser {
  name: string;
}

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
  candidates?: Array<{
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl?: string;
    distance?: number;
  }>;
  participants?: Array<{ label: string; lat: number; lng: number }>;
  user?: ShareUser; // ⭐ 추가
}
```

### 2.3 Share 데이터 요청 예시

```typescript
async function fetchShare(shareId: string): Promise<ShareResponse> {
  const res = await fetch(`${BACKEND_URL}/api/share/${shareId}`);
  if (!res.ok) throw new Error('Failed to load share data');
  return res.json();
}
```

### 2.4 공유한 사용자 이름 표시 예시 (React)

```tsx
function SharePage() {
  const [data, setData] = useState<ShareResponse | null>(null);

  useEffect(() => {
    const shareId = getShareIdFromUrl();
    fetchShare(shareId).then(setData);
  }, []);

  if (!data) return <div>로딩 중...</div>;

  return (
    <div>
      {/* 공유한 사용자 표시 (있을 때만) */}
      {data.user && (
        <div className="text-sm text-gray-600 mb-2">
          <strong>{data.user.name}</strong> 님이 공유했습니다
        </div>
      )}

      {/* 나머지 지도/리스트 UI... */}
    </div>
  );
}
```

---

## 3. Recommend 기능 변경사항 (카테고리 지원)

### 3.1 백엔드 요청/응답 구조

요청 형식:

```json
{
  "participants": [
    { "label": "A", "lat": 37.5665, "lng": 126.978 },
    { "label": "B", "lat": 37.5651, "lng": 126.9895 }
  ],
  "category": "SW8"  // 선택적
}
```

- **`category` (선택 필드)**:
  - `"SW8"`: 지하철역
  - `"CT1"`: 문화시설
  - `"PO3"`: 공공기관
  - `"AT4"`: 관광명소
  - 생략하면 기존처럼 **모든 카테고리 순서대로 탐색**함.

응답 구조(기존과 동일):

```json
{
  "anchor": { "lat": 37.5658, "lng": 126.9837 },
  "final": { /* 최종 추천 장소 */ },
  "candidates": [ /* 후보 리스트 */ ],
  "used": { "category": "SW8", "radius": 2000 },
  "message": "추천 가능한 랜드마크를 찾지 못했습니다."
}
```

### 3.2 프론트엔드 타입 정의 예시

```typescript
type CategoryCode = 'SW8' | 'CT1' | 'PO3' | 'AT4';

interface RecommendRequest {
  participants: Array<{ label: string; lat: number; lng: number }>;
  category?: CategoryCode;
}

interface RecommendResult {
  anchor: { lat: number; lng: number };
  final: Place | null;
  candidates: Place[];
  used: { category: CategoryCode; radius: number } | null;
  message?: string;
}

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}
```

### 3.3 추천 요청 함수 예시

```typescript
async function requestRecommend(
  participants: RecommendRequest['participants'],
  category?: CategoryCode,
  accessToken?: string
): Promise<RecommendResult> {
  const res = await fetch(`${BACKEND_URL}/api/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify({
      participants,
      ...(category && { category }), // ⭐ 있으면만 포함
    }),
  });

  if (!res.ok) throw new Error('Recommend API failed');
  return res.json();
}
```

### 3.4 카테고리 선택 UI 예시

```tsx
const CATEGORY_OPTIONS: { value: CategoryCode; label: string }[] = [
  { value: 'SW8', label: '지하철역' },
  { value: 'CT1', label: '문화시설' },
  { value: 'PO3', label: '공공기관' },
  { value: 'AT4', label: '관광명소' },
];

function CategorySelector({
  value,
  onChange,
}: {
  value?: CategoryCode;
  onChange: (value?: CategoryCode) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) =>
        onChange(e.target.value ? (e.target.value as CategoryCode) : undefined)
      }
    >
      <option value="">전체 (기존 로직)</option>
      {CATEGORY_OPTIONS.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
```

### 3.5 카테고리별로 동시에 호출해서 UI에 보여주기 (선택)

```typescript
async function getAllCategoryRecommends(
  participants: RecommendRequest['participants'],
) {
  const categories: CategoryCode[] = ['SW8', 'CT1', 'PO3', 'AT4'];

  const results = await Promise.all(
    categories.map((category) => requestRecommend(participants, category)),
  );

  return {
    SW8: results[0],
    CT1: results[1],
    PO3: results[2],
    AT4: results[3],
  };
}
```

---

## 4. 프론트엔드 체크리스트

### Share 관련

- [ ] `GET /api/share/:id` 응답 타입에 `user?: { name: string }` 추가
- [ ] `user`가 존재할 때만 "○○님이 공유했습니다" 등의 문구 표시
- [ ] `user`가 없는 경우(게스트 공유)에도 UI가 에러 없이 동작하는지 확인

### Recommend 관련

- [ ] `POST /api/recommend` 요청 바디에 `category?: 'SW8' | 'CT1' | 'PO3' | 'AT4'` 필드를 추가할 수 있도록 수정
- [ ] 카테고리 선택 UI(셀렉트 박스, 탭 등)를 추가하여 `category` 값을 선택/변경 가능하도록 구현 (선택)
- [ ] `category`를 지정하지 않은 경우, 기존과 동일하게 동작하는지 확인
- [ ] `used.category` 값을 이용해 결과 카드/태그에 카테고리 정보를 표시하는 방식을 고려 (선택)

---

## 5. 호환성

- `user` 필드는 선택적 필드이므로, 기존 Share 응답을 사용하던 코드와 **완전히 호환**됩니다.
- `category` 역시 선택적 파라미터이므로, 기존 Recommend 요청(`participants`만 전송)은 그대로 동작합니다.


