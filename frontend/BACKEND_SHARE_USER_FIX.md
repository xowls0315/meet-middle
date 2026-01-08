# 백엔드 Share API user 필드 미반환 문제

## 🔴 문제 상황

로그인한 사용자가 공유 링크를 생성하고 조회했을 때, 백엔드 응답에 `user` 필드가 포함되지 않습니다.

### 실제 응답 (현재)

```json
{
  "anchor": {...},
  "final": {...},
  "candidates": [...],
  "participants": [...]
  // ❌ user 필드 없음
}
```

### 예상 응답 (수정 후)

```json
{
  "anchor": {...},
  "final": {...},
  "candidates": [...],
  "participants": [...],
  "user": {
    "name": "황태진"  // ✅ 로그인한 사용자가 공유한 경우
  }
}
```

## 🔍 원인 분석

### 1. 공유 생성 시 사용자 정보 미저장

`POST /api/share`에서 JWT 토큰을 읽어서 사용자 정보를 저장하지 않고 있을 가능성이 높습니다.

**확인 필요 사항:**

- [ ] 공유 생성 API에 선택적 인증 미들웨어 적용 여부
- [ ] `req.user`에서 사용자 정보 추출 여부
- [ ] 공유 데이터 저장 시 `userId` 또는 `userName` 저장 여부

### 2. 공유 조회 시 사용자 정보 미반환

`GET /api/share/:id`에서 저장된 사용자 정보를 응답에 포함하지 않고 있을 가능성이 높습니다.

**확인 필요 사항:**

- [ ] 데이터베이스에서 공유 데이터 조회 시 사용자 정보도 함께 조회 여부
- [ ] 응답 객체에 `user` 필드 포함 여부
- [ ] 사용자 정보가 없을 때 필드 생략 처리 여부

## ✅ 백엔드 수정 필요 사항

### 1. 공유 생성 API (`POST /api/share`)

**현재 문제:**

- 로그인한 사용자가 공유를 생성해도 사용자 정보가 저장되지 않음

**수정 방법:**

```typescript
// NestJS 예시
@Post('/share')
@UseGuards(OptionalJwtAuthGuard) // 선택적 인증 미들웨어
async createShare(@Body() data: ShareRequest, @Req() req) {
  // JWT 토큰이 있으면 사용자 정보 추출
  const userId = req.user?.id;
  const userName = req.user?.name;

  const share = await this.shareService.create({
    ...data,
    userId: userId || null,
    userName: userName || null, // 로그인하지 않은 경우 null
  });

  return { shareId: share.id, url: `...` };
}
```

**체크리스트:**

- [ ] 선택적 인증 미들웨어 적용 (`OptionalJwtAuthGuard`)
- [ ] `req.user`에서 사용자 정보 추출
- [ ] 공유 데이터 저장 시 `userId` 또는 `userName` 저장
- [ ] 로그인하지 않은 경우에도 공유 생성 가능 (게스트 모드)

### 2. 공유 조회 API (`GET /api/share/:id`)

**현재 문제:**

- 저장된 사용자 정보가 응답에 포함되지 않음

**수정 방법:**

```typescript
// NestJS 예시
@Get('/share/:id')
async getShare(@Param('id') id: string) {
  const share = await this.shareService.findById(id, {
    include: { user: true }, // 사용자 정보도 함께 조회
  });

  // 응답 객체 구성
  const response = {
    anchor: share.anchor,
    final: share.final,
    candidates: share.candidates,
    participants: share.participants,
    // 사용자 정보가 있으면 포함
    ...(share.userName && {
      user: {
        name: share.userName,
      },
    }),
  };

  return response;
}
```

**또는 데이터베이스 조인 방식:**

```typescript
@Get('/share/:id')
async getShare(@Param('id') id: string) {
  const share = await this.shareService.findById(id, {
    relations: ['user'], // User 관계도 함께 조회
  });

  return {
    ...share,
    ...(share.user && {
      user: {
        name: share.user.name,
      },
    }),
  };
}
```

**체크리스트:**

- [ ] 데이터베이스에서 공유 데이터 조회 시 사용자 정보도 함께 조회
- [ ] 응답에 `user` 필드 포함 (로그인한 사용자가 공유한 경우)
- [ ] `user` 필드가 없으면 응답에서 생략 (게스트 공유)

### 3. 데이터베이스 스키마 확인

**Share 엔티티에 사용자 정보 필드 존재 확인:**

```typescript
@Entity()
export class Share {
  // ... 기존 필드들

  // 방법 1: User 관계 사용
  @ManyToOne(() => User, { nullable: true })
  user?: User;

  // 방법 2: 직접 저장
  @Column({ nullable: true })
  userName?: string;
}
```

**체크리스트:**

- [ ] Share 테이블에 `userId` 또는 `userName` 필드 존재
- [ ] 필드가 `nullable: true`로 설정 (게스트 공유 허용)
- [ ] 데이터베이스 마이그레이션 완료

## 🧪 테스트 방법

### 1. 공유 생성 테스트

1. 로그인한 상태에서 장소 추천 받기
2. "공유 링크 만들기" 버튼 클릭
3. 생성된 공유 링크 접속
4. 콘솔 로그 확인: `response.data.keys`에 `'user'` 포함 여부
5. 화면 확인: "황태진 님이 공유한 만남 장소 추천입니다" 표시 여부

### 2. 게스트 공유 테스트

1. 로그인하지 않은 상태에서 장소 추천 받기
2. "공유 링크 만들기" 버튼 클릭
3. 생성된 공유 링크 접속
4. 화면 확인: "다른 사람이 공유한 만남 장소 추천입니다" 표시 여부

## 📋 디버깅 체크리스트

백엔드 개발자가 확인해야 할 사항:

### 공유 생성 시

- [ ] `POST /api/share` 요청에 JWT 토큰이 포함되어 있는가?
- [ ] `req.user`에 사용자 정보가 있는가?
- [ ] 공유 데이터 저장 시 `userId` 또는 `userName`이 저장되는가?
- [ ] 데이터베이스에 실제로 저장되는지 확인

### 공유 조회 시

- [ ] `GET /api/share/:id` 응답에 `user` 필드가 포함되어 있는가?
- [ ] 데이터베이스에서 사용자 정보가 함께 조회되는가?
- [ ] 응답 객체 구성 시 `user` 필드가 포함되는가?

## 📝 프론트엔드 상태

프론트엔드는 이미 올바르게 구현되어 있습니다:

✅ 타입 정의: `user?: { name: string; }`
✅ 조건부 렌더링: `shareData.user?.name` 체크
✅ API 호출: 정상 작동
✅ 디버깅 로그: 응답 구조 확인 가능

**프론트엔드 수정 불필요**

---

**마지막 업데이트:** 2025년 1월
