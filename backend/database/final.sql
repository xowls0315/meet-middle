-- ============================================
-- 약속 장소 중간지점 추천 서비스 - PostgreSQL 스키마
-- DBeaver 등에서 PostgreSQL DB에 연결 후 전체 실행
-- (PostgreSQL 13+ 기본 함수 gen_random_uuid() 사용, 확장 불필요)
-- ============================================

-- ============================================
-- 1. users 테이블 (사용자)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "kakaoId" VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(255) NOT NULL,
    "profileImage" VARCHAR(500),
    email VARCHAR(255),
    "refreshToken" VARCHAR(500) NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_kakao_id ON users("kakaoId");
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users("refreshToken") WHERE "refreshToken" IS NOT NULL;

-- ============================================
-- 2. shares 테이블 (공유 링크)
-- ============================================
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "shareId" VARCHAR(255) NOT NULL UNIQUE,
    data JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shares_share_id ON shares("shareId");
CREATE INDEX IF NOT EXISTS idx_shares_expires_at ON shares("expiresAt");

-- ============================================
-- 3. meetings 테이블 (약속 기록)
-- ============================================
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    data JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meetings_user FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings("userId");
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings("createdAt" DESC);

-- ============================================
-- 4. favorites 테이블 (즐겨찾기)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "placeId" VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    lat DECIMAL(10, 6) NOT NULL,
    lng DECIMAL(10, 6) NOT NULL,
    "placeUrl" VARCHAR(500),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorites_user FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_favorites_user_place UNIQUE ("userId", "placeId")
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites("userId");
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites("createdAt" DESC);

-- ============================================
-- 스키마 생성 완료
-- ============================================
