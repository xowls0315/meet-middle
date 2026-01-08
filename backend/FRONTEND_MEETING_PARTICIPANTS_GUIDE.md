# 프론트엔드 수정 가이드: Meeting API 참가자 정보 추가

## 📋 변경 사항 요약

Meeting(기록) 저장/조회 API에 참가자별 장소 정보가 추가되었습니다. 기록 페이지에서 "A: 장소, B: 장소" 형식으로 표시할 수 있습니다.

---

## 🔧 API 변경 사항

### 1. POST /api/meetings - 기록 저장

**변경된 Request Body:**

```typescript
{
  final: Place;           // 기존과 동일
  participantCount: number; // 기존과 동일
  participants: Array<{    // ⭐ 새로 추가 (필수)
    label: string;         // "A", "B", "C", "D"
    name: string;          // 장소 이름 (예: "홍대입구역")
    address?: string;      // 장소 주소 (선택적)
  }>;
}
```

**중요:**
- `participants`는 **필수 필드**입니다
- `participants.length`는 반드시 `participantCount`와 일치해야 합니다

**예시:**

```typescript
const response = await axios.post('/api/meetings', {
  final: {
    placeId: '8241891',
    name: '강남역',
    address: '서울특별시 강남구 강남대로 396',
    lat: 37.4981,
    lng: 127.0276,
    placeUrl: 'http://place.map.kakao.com/m/8241891',
  },
  participantCount: 2,
  participants: [
    { label: 'A', name: '홍대입구역', address: '서울특별시 마포구 양화로 160' },
    { label: 'B', name: '강남역', address: '서울특별시 강남구 강남대로 396' },
  ],
}, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  withCredentials: true,
});
```

---

### 2. GET /api/meetings - 기록 목록 조회

**변경된 Response:**

```typescript
Array<{
  id: string;
  createdAt: string;
  final: Place;           // 기존과 동일
  participantCount: number; // 기존과 동일
  participants: Array<{    // ⭐ 새로 추가 (필수)
    label: string;         // "A", "B", "C", "D"
    name: string;          // 장소 이름
    address?: string;      // 장소 주소 (선택적)
  }>;
}>
```

**예시:**

```typescript
interface Meeting {
  id: string;
  createdAt: string;
  final: {
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    placeUrl: string;
    distance?: number;
  };
  participantCount: number;
  participants: Array<{
    label: string;
    name: string;
    address?: string;
  }>;
}

const meetings: Meeting[] = await axios.get('/api/meetings', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  withCredentials: true,
}).then(res => res.data);
```

---

## 💻 프론트엔드 수정 예시

### 1. 기록 저장 시 참가자 정보 포함

**기존 코드 예시:**

```typescript
// ❌ 기존: participants 없음
await saveMeeting({
  final: selectedPlace,
  participantCount: participants.length,
});
```

**수정 후 코드:**

```typescript
// ✅ 수정: participants 포함
await saveMeeting({
  final: selectedPlace,
  participantCount: participants.length,
  participants: participants.map((p, index) => ({
    label: String.fromCharCode(65 + index), // "A", "B", "C", "D"
    name: p.name,                            // 참가자 장소 이름
    address: p.address,                      // 참가자 장소 주소 (있으면)
  })),
});
```

**전체 예시:**

```typescript
async function saveMeeting(meetingData: {
  final: Place;
  participantCount: number;
  participants: Array<{ label: string; name: string; address?: string }>;
}) {
  const response = await axios.post(
    '/api/meetings',
    meetingData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
}

// 사용 예시
const participants = [
  { name: '홍대입구역', address: '서울특별시 마포구 양화로 160', lat: 37.5563, lng: 126.9233 },
  { name: '강남역', address: '서울특별시 강남구 강남대로 396', lat: 37.4981, lng: 127.0276 },
];

await saveMeeting({
  final: selectedPlace,
  participantCount: participants.length,
  participants: participants.map((p, index) => ({
    label: String.fromCharCode(65 + index), // "A", "B"
    name: p.name,
    address: p.address,
  })),
});
```

### 2. 기록 목록에서 참가자 정보 표시

**UI 표시 예시:**

```tsx
// React 예시
function MeetingList({ meetings }: { meetings: Meeting[] }) {
  return (
    <div>
      {meetings.map((meeting) => (
        <div key={meeting.id}>
          <h3>{meeting.final.name}</h3>
          <p>만난 날짜: {new Date(meeting.createdAt).toLocaleDateString()}</p>
          
          {/* 참가자 정보 표시 */}
          <div>
            <strong>참가자 위치:</strong>
            <ul>
              {meeting.participants.map((participant) => (
                <li key={participant.label}>
                  {participant.label}: {participant.name}
                  {participant.address && ` (${participant.address})`}
                </li>
              ))}
            </ul>
          </div>
          
          {/* 또는 "A: 장소, B: 장소" 형식으로 표시 */}
          <div>
            {meeting.participants
              .map((p) => `${p.label}: ${p.name}`)
              .join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**또는 간단한 텍스트 형식:**

```typescript
// "A: 홍대입구역, B: 강남역" 형식으로 표시
function formatParticipants(meeting: Meeting): string {
  return meeting.participants
    .map((p) => `${p.label}: ${p.name}`)
    .join(', ');
}

// 사용
const text = formatParticipants(meeting);
// 결과: "A: 홍대입구역, B: 강남역"
```

---

## ✅ 체크리스트

프론트엔드 개발자가 확인해야 할 사항:

- [ ] `POST /api/meetings` 요청에 `participants` 필드 추가
- [ ] `participants` 배열의 `label`을 올바르게 생성 ("A", "B", "C", "D")
- [ ] `participants.length`가 `participantCount`와 일치하는지 확인
- [ ] `GET /api/meetings` 응답에서 `participants` 필드 사용
- [ ] 기록 목록/상세 페이지에서 참가자 정보 표시 ("A: 장소, B: 장소" 형식)

---

## ⚠️ 주의사항

1. **필수 필드**: `participants`는 필수 필드이므로 반드시 포함해야 합니다.
2. **데이터 검증**: 백엔드에서 `participants.length !== participantCount`인 경우 400 에러를 반환합니다.
3. **기존 데이터**: 마이그레이션 전에 저장된 기록은 `participants`가 빈 배열 `[]`일 수 있습니다. 이 경우를 처리하세요:
   ```typescript
   if (meeting.participants.length === 0) {
     // 기존 데이터 처리 (참가자 정보 표시 안 함 또는 기본 메시지)
   }
   ```

---

## 📝 TypeScript 타입 정의

```typescript
interface Participant {
  label: string;      // "A", "B", "C", "D"
  name: string;       // 장소 이름
  address?: string;   // 장소 주소 (선택적)
}

interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl: string;
  distance?: number;
}

interface CreateMeetingRequest {
  final: Place;
  participantCount: number;
  participants: Participant[]; // 필수
}

interface Meeting {
  id: string;
  createdAt: string;
  final: Place;
  participantCount: number;
  participants: Participant[]; // 필수
}
```

