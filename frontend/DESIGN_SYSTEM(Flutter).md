# Meet-Middle 프론트엔드 디자인 시스템 (Flutter 연동용)

프로젝트의 폰트, 색상, 간격, 컴포넌트 스타일을 정리한 문서입니다. 모바일(Flutter) 개발 시 동일한 톤앤매너 적용을 위해 참고하세요.

---

## 1. 폰트 (Typography)

### 1.1 폰트 패밀리

| 용도 | 폰트명 | 비고 |
|------|--------|------|
| **본문/제목** | SchoolSafetyWing (학교안심날개R) | 커스텀 TTF: `/Hakgyoansim_NalgaeR.ttf` |
| **보조** | Geist Sans | Next.js `next/font/google` (변수: `--font-geist-sans`) |
| **코드/고정폭** | Geist Mono | 변수: `--font-geist-mono` |
| **폴백** | system-ui, -apple-system, sans-serif | |

- body 기본: `font-family: "SchoolSafetyWing", system-ui, -apple-system, sans-serif`
- Flutter: Geist는 Google Fonts에 없을 수 있으므로, 본문은 **Noto Sans KR** 또는 **Pretendard**로 대체 후, SchoolSafetyWing TTF는 에셋으로 포함해 사용 권장.

### 1.2 폰트 크기 (Font Size)

| 클래스 | 대략 치수 | 용도 |
|--------|------------|------|
| `text-xs` | 12px | 캡션, 배지, 보조 문구 |
| `text-sm` | 14px | 본문 보조, 버튼 작은 사이즈, 링크 |
| `text-base` | 16px | 기본 본문 |
| `text-lg` | 18px | 소제목, 강조 문구 |
| `text-xl` | 20px | 카드 제목, 섹션 제목 |
| `text-2xl` | 24px | 헤더 로고(모바일) |
| `text-4xl` | 36px | 메인 타이틀 |
| `text-5xl` | 48px | 메인 타이틀(데스크톱) |

### 1.3 폰트 굵기 (Font Weight)

| 클래스 | 값 | 용도 |
|--------|-----|------|
| `font-normal` | 400 | 본문 |
| `font-medium` | 500 | 버튼, 링크, 강조 |
| `font-semibold` | 600 | 소제목, 배지 |
| `font-bold` | 700 | 제목, 숫자 강조 |

---

## 2. 색상 (Colors)

### 2.1 CSS 변수 (globals.css 기준)

```css
--background:    #ffffff;
--foreground:   #1e293b;   /* 텍스트 기본 */
--gradient-start: #3b82f6; /* blue-500 */
--gradient-end:   #1e40af; /* blue-800 */
--gradient-light: #dbeafe; /* blue-100 */
--gradient-mid:   #93c5fd; /* blue-300 */
```

### 2.2 메인 컬러 (Blue – Primary)

| 이름 | HEX | 용도 |
|------|-----|------|
| blue-50 | `#eff6ff` | 배경 연한 파랑 |
| blue-100 | `#dbeafe` | 배경, 호버 배경 |
| blue-200 | `#bfdbfe` | 테두리, 구분선 |
| blue-300 | `#93c5fd` | 그라데이션 중간 |
| blue-400 | `#60a5fa` | 배지, 아이콘 배경 |
| blue-500 | `#3b82f6` | **메인 버튼 시작** |
| blue-600 | `#2563eb` | **메인 버튼 끝, 호버** |
| blue-700 | `#1d4ed8` | 호버 강조 |
| blue-800 | `#1e40af` | 그라데이션 끝 |
| blue-900 | `#1e3a8a` | 최종 추천 카드 제목 |

### 2.3 중립/텍스트 (Slate)

| 이름 | HEX | 용도 |
|------|-----|------|
| slate-500 | `#64748b` | 보조 문구, 캡션 |
| slate-600 | `#475569` | 부제목, 설명 |
| slate-700 | `#334155` | 본문, 네비 링크 |
| slate-800 | `#1e293b` | 제목, 강조 텍스트 |

### 2.4 회색 (Gray – 비활성/비활성화)

| 이름 | HEX | 용도 |
|------|-----|------|
| gray-100 | `#f3f4f6` | 배경, 버튼(비활성) |
| gray-200 | `#e5e7eb` | 스켈레톤 |
| gray-300 | `#d1d5db` | 비활성 버튼 배경 |
| gray-400 | `#9ca3af` | 비활성 텍스트 |
| gray-500 | `#6b7280` | 비활성 버튼 텍스트 |
| gray-700 | `#374151` | 일반 버튼 텍스트 |

### 2.5 상태/액션 컬러

| 용도 | 배경 | 텍스트/테두리 |
|------|------|----------------|
| **성공/로그인** | green-50 `#f0fdf4`, green-200 | green-700 `#15803d`, green-800 |
| **경고/일반계정** | amber-50 `#fffbeb`, amber-200 | amber-700 `#b45309`, amber-800 |
| **로그아웃/삭제** | red-50 `#fef2f2`, red-200 | red-700 `#b91c1c`, red-800 |
| **카카오 로그인** | `#FEE500`, hover `#FDE74E` | text `#1a1a1a` (slate-900) |

### 2.6 페이지 배경 그라데이션

```css
background: linear-gradient(135deg, #b2e2ff 0%, #dbeafe 50%, #bfdbfe 100%);
background-attachment: fixed;
```

- Flutter: `LinearGradient` 또는 `BoxDecoration.gradient`로 동일 각도(135deg)와 색 정지 적용.

---

## 3. 간격 (Spacing)

Tailwind 기본 스케일(1단위 = 4px) 기준:

| 클래스 | px | 용도 |
|--------|-----|------|
| 1 | 4px | 아이콘-텍스트 갭 |
| 2 | 8px | 요소 내부 여백, gap |
| 3 | 12px | 버튼 패딩(작은) |
| 4 | 16px | 컨테이너 px, 일반 패딩 |
| 6 | 24px | 섹션 간격, 카드 내부 |
| 8 | 32px | 상하 블록 여백 |
| 20 | 80px | 에러 페이지 등 |

자주 쓰는 조합:
- `p-4`, `p-6`: 카드/모달 패딩
- `px-4 py-2`, `px-6 py-3`: 버튼
- `gap-2`, `gap-4`, `gap-6`: flex/grid 간격
- `mb-2`, `mb-4`, `mb-6`, `mb-8`: 블록 하단 여백

---

## 4. 모서리 (Border Radius)

| 클래스 | 대략 값 | 용도 |
|--------|----------|------|
| `rounded-lg` | 8px | 버튼, 입력창, 카드 |
| `rounded-xl` | 12px | 큰 카드, 결과 카드 |
| `rounded-full` | 9999px | 배지, 프로필 원, pill 버튼 |
| `rounded-2xl` | 16px | 모달 |

---

## 5. 그림자 (Shadows)

| 클래스 | 용도 |
|--------|------|
| `shadow-sm` | 헤더 하단 |
| `shadow-md` | 카드, 버튼, 드롭다운 |
| `shadow-lg` | 강조 카드, CTA 버튼 |
| `shadow-xl` | 모달, 플로팅 패널 |
| `shadow-2xl` | 사이드 메뉴, 모달 |

---

## 6. 컴포넌트별 스타일 요약

### 6.1 헤더
- 배경: `bg-white/80`, `backdrop-blur-md`
- 테두리: `border-b border-blue-200/50`
- 로고: `text-xl sm:text-2xl font-bold` + 그라데이션 텍스트
- 네비 링크: `text-slate-700`, hover `text-blue-600`, `bg-blue-50`, `rounded-full`, `border border-blue-200`
- 로그인 버튼: `bg-gradient-to-r from-blue-500 to-blue-600`, `text-white`, `rounded-full`, `shadow-md`

### 6.2 메인 타이틀
- "Meet-Middle": `text-4xl md:text-5xl font-bold` + `.gradient-text`
- 부제: `text-lg font-bold text-slate-600`
- 캡션: `text-sm text-slate-500`

### 6.3 카드 (참가자 수 선택, 결과 영역)
- 배경: `bg-white`
- 테두리: `border-2 border-blue-200`
- 모서리: `rounded-xl`
- 그림자: `shadow-lg`
- 내부 패딩: `p-6`

### 6.4 버튼

| 타입 | 배경 | 텍스트 | 비고 |
|------|------|--------|------|
| **Primary** | `from-blue-500 to-blue-600` | white | hover: `from-blue-600 to-blue-700`, `shadow-md` |
| **Secondary** | `bg-blue-50` | `text-blue-600` | `border border-blue-200`, hover `bg-blue-100` |
| **선택됨** | `from-blue-500 to-blue-600` | white | 카테고리/참가자 수 선택 시 |
| **비활성** | `bg-gray-300` | `text-gray-500` | `cursor-not-allowed` |
| **일반(회색)** | `bg-gray-100` | `text-gray-700` | hover `bg-gray-200` (다시하기 등) |

### 6.5 결과 카드 (ResultCard)
- **최종 추천**: `bg-gradient-to-br from-blue-50 to-blue-100`, `border-2 border-blue-400`, `shadow-lg`
- **일반 후보**: `bg-white`, `border-2 border-blue-200`, hover `border-blue-300`, `shadow-md`
- 배지 "최종 추천": `from-blue-500 to-blue-600`, `text-white`, `text-xs font-bold`, `rounded-full`
- 카드 제목: `text-xl font-bold` (최종: `text-blue-900`, 후보: `text-slate-800`)
- 주소/거리: `text-sm text-slate-600`, `text-slate-500`
- "선택" 버튼: `bg-blue-500 text-white`, hover `bg-blue-600`, `rounded-lg`

### 6.6 입력 필드
- 컨테이너: `border-2 border-blue-200`, `rounded-xl`, `bg-white`
- 포커스/호버: `border-blue-300` 등으로 강조

### 6.7 스크롤바 (웹)
- 트랙: `#f1f5f9`
- 썸: 그라데이션 `#3b82f6` → `#1e40af`, `border-radius: 4px`
- 너비/높이: 8px

---

## 7. 반응형 브레이크포인트

| 브레이크포인트 | 최소 너비 | 용도 |
|----------------|-----------|------|
| (기본) | 0px | 모바일 |
| `sm` | 640px | 작은 패딩/폰트 조정 |
| `md` | 768px | 2열 그리드, 타이틀 크기 |
| `max-w-6xl` | 1152px | 컨테이너 최대 너비 |

---

## 8. Flutter 매핑 예시

- **Primary**: `Color(0xFF3B82F6)` (blue-500), `Color(0xFF2563EB)` (blue-600)
- **배경 그라데이션**: `LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFFB2E2FF), Color(0xFFDBEAFE), Color(0xFFBFDBFE)])`
- **그라데이션 텍스트**: `ShaderMask` + 동일 그라데이션 또는 `GradientText` 패키지
- **Border radius**: 8.0 (lg), 12.0 (xl), 999 (full)
- **폰트**: `fontSize: 12–48`, `fontWeight: FontWeight.w400/w500/w600/w700`

이 문서는 `meet-middle/frontend`의 `styles/globals.css`, `app/layout.tsx`, 및 주요 컴포넌트(Header, page, ResultCard 등)를 기준으로 작성되었습니다. Tailwind v4 + Next.js 16 환경입니다.
