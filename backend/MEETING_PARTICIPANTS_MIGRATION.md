# Meeting API 참가자 정보 추가 - 마이그레이션 가이드

## 📋 변경 사항

Meeting(기록) API에 참가자별 장소 정보를 추가했습니다.

### 데이터베이스 스키마 변경

`meetings` 테이블의 `data` JSONB 컬럼에 `participants` 필드가 추가되었습니다.

**기존 구조:**
```json
{
  "final": { ... },
  "participantCount": 2
}
```

**변경 후 구조:**
```json
{
  "final": { ... },
  "participantCount": 2,
  "participants": [
    { "label": "A", "name": "홍대입구역", "address": "서울특별시 마포구 양화로 160" },
    { "label": "B", "name": "강남역", "address": "서울특별시 강남구 강남대로 396" }
  ]
}
```

## 🔧 마이그레이션 필요 사항

### 1. 기존 데이터 마이그레이션

이미 저장된 Meeting 데이터에는 `participants` 필드가 없습니다. 다음 SQL을 실행하여 기존 데이터에 빈 배열을 추가하세요:

```sql
-- 기존 meetings 데이터의 data JSONB에 participants 필드 추가 (빈 배열)
UPDATE meetings
SET data = jsonb_set(
  data,
  '{participants}',
  '[]'::jsonb,
  true
)
WHERE NOT (data ? 'participants');
```

또는 TypeORM 마이그레이션 파일로 실행:

```typescript
// migrations/XXXXX-add-participants-to-meetings.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParticipantsToMeetingsXXXXX implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE meetings
      SET data = jsonb_set(
        data,
        '{participants}',
        '[]'::jsonb,
        true
      )
      WHERE NOT (data ? 'participants');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: participants 필드 제거
    await queryRunner.query(`
      UPDATE meetings
      SET data = data - 'participants'
      WHERE data ? 'participants';
    `);
  }
}
```

### 2. 애플리케이션 재시작

마이그레이션 후 애플리케이션을 재시작하세요.

## ✅ 체크리스트

- [ ] 데이터베이스 마이그레이션 실행 (기존 데이터에 `participants: []` 추가)
- [ ] 애플리케이션 재시작
- [ ] `POST /api/meetings` 테스트 (participants 필드 포함)
- [ ] `GET /api/meetings` 테스트 (응답에 participants 필드 확인)

## 📝 API 변경 사항

### POST /api/meetings

**Request Body 변경:**
- ✅ `participants` 필드 **필수 추가**
- `participants` 배열 길이는 `participantCount`와 일치해야 함

**예시:**
```json
{
  "final": {
    "placeId": "8241891",
    "name": "강남역",
    "address": "서울특별시 강남구 강남대로 396",
    "lat": 37.4981,
    "lng": 127.0276,
    "placeUrl": "http://place.map.kakao.com/m/8241891"
  },
  "participantCount": 2,
  "participants": [
    { "label": "A", "name": "홍대입구역", "address": "서울특별시 마포구 양화로 160" },
    { "label": "B", "name": "강남역", "address": "서울특별시 강남구 강남대로 396" }
  ]
}
```

### GET /api/meetings

**Response 변경:**
- ✅ 모든 응답에 `participants` 필드 **필수 포함**
- 기존 데이터는 빈 배열 `[]`로 반환됨

**예시:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-01-06T12:00:00.000Z",
    "final": { ... },
    "participantCount": 2,
    "participants": [
      { "label": "A", "name": "홍대입구역", "address": "서울특별시 마포구 양화로 160" },
      { "label": "B", "name": "강남역", "address": "서울특별시 강남구 강남대로 396" }
    ]
  }
]
```

## ⚠️ 주의사항

1. **기존 데이터**: 마이그레이션 전에 저장된 기록은 `participants`가 빈 배열 `[]`로 저장됩니다.
2. **필수 필드**: `participants`는 필수 필드이므로, 모든 새 저장 요청에 포함되어야 합니다.
3. **데이터 검증**: `participants.length`가 `participantCount`와 일치하지 않으면 400 에러가 반환됩니다.

