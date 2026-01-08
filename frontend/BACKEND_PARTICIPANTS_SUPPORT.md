# 백엔드 지원 필요 사항: 기록(Meeting) API에 참가자 정보 추가

## 📋 요청 내용

기록 저장/조회 API에 참가자별 장소 정보를 추가하여, 기록 페이지에서 "A: 장소, B: 장소" 형식으로 표시할 수 있도록 해야 합니다.

---

## 🔧 수정 필요 사항

### 1. `POST /api/meetings` - 기록 저장

**현재 Request Body:**

```typescript
{
  final: Place;
  participantCount: number;
}
```

**변경 후 Request Body:**

```typescript
{
  final: Place;
  participantCount: number;
  participants: Array<{
    label: string; // "A", "B", "C", "D"
    name: string; // 장소 이름 (예: "홍대입구역")
    address?: string; // 장소 주소 (선택적)
  }>;
}
```

**변경 내용:**

- `participants` 필드를 **필수(required)**로 추가
- 모든 저장 요청에 참가자 정보가 포함되어야 함

---

### 2. `GET /api/meetings` - 기록 목록 조회

**현재 Response:**

```typescript
[
  {
    id: string;
    createdAt: string;
    final: Place;
    participantCount: number;
  }
]
```

**변경 후 Response:**

```typescript
[
  {
    id: string;
    createdAt: string;
    final: Place;
    participantCount: number;
    participants: Array<{
      label: string;      // "A", "B", "C", "D"
      name: string;       // 장소 이름
      address?: string;   // 장소 주소 (선택적)
    }>;
  }
]
```

**변경 내용:**

- 응답에 `participants` 필드를 **필수(required)**로 추가
- 모든 기록 조회 응답에 참가자 정보가 포함됨

---

## 📊 데이터베이스 스키마

### Meeting 엔티티에 필드 추가

```typescript
// 예시 (NestJS + TypeORM)
@Entity()
export class Meeting {
  // ... 기존 필드들

  @Column({ type: "json" })
  participants: Array<{
    label: string;
    name: string;
    address?: string;
  }>;
}
```

또는 별도 테이블로 분리:

```typescript
@Entity()
export class MeetingParticipant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Meeting, (meeting) => meeting.participants)
  meeting: Meeting;

  @Column()
  label: string; // "A", "B", "C", "D"

  @Column()
  name: string; // 장소 이름

  @Column({ nullable: true })
  address?: string; // 장소 주소
}
```

---

## ✅ 체크리스트

- [ ] `POST /api/meetings`에서 `participants` 필드를 **필수로** 받아서 저장
- [ ] `GET /api/meetings`에서 저장된 `participants` 정보를 **항상** 반환
- [ ] `participants`는 필수 필드이므로, 요청/응답에서 누락되지 않도록 검증 추가
- [ ] 데이터베이스 마이그레이션: 기존 데이터에 `participants` 필드 추가 (기본값 설정 필요)

---

## 📝 참고 사항

- **필수 필드**: `participants`는 필수 필드이므로, 모든 요청에 포함되어야 합니다.
- **기존 데이터 마이그레이션**: 이미 저장된 기록에는 `participants`가 없을 수 있으므로, 마이그레이션 시 기본값(빈 배열 또는 기존 데이터 기반 재구성) 설정 필요
- **데이터 유효성 검증**:
  - 저장 시 `participants` 필드가 반드시 포함되어야 함
  - `participants.length`가 `participantCount`와 일치하는지 검증 필요
  - 각 `participant`의 `label`, `name` 필드가 비어있지 않은지 검증 필요

---

**마지막 업데이트:** 2025년 1월
