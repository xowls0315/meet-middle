// 공통 타입 정의

export interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
  distance?: number;
}

export interface Participant {
  label: string;
  query: string;
  selectedPlace: Place | null;
}

export type ParticipantCount = 2 | 3 | 4;

export interface RecommendResponse {
  anchor?: { lat: number; lng: number };
  final?: Place;
  candidates?: Place[];
  used?: { category: string; radius: number };
}

// 여러 카테고리 추천 결과
export interface CategoryRecommendResult {
  category: string;
  categoryName: string;
  final?: Place;
  candidates?: Place[];
  radius: number;
}

export interface MultiCategoryRecommendResponse {
  anchor?: { lat: number; lng: number };
  categories: CategoryRecommendResult[];
}

// 카테고리 코드 타입
export type CategoryCode = "SW8" | "CT1" | "PO3" | "AT4";

// API 요청/응답 타입
export interface RecommendRequest {
  participants: Array<{
    label: string;
    lat: number;
    lng: number;
  }>;
  category?: CategoryCode; // 선택적 카테고리 파라미터
}

export interface ShareRequest {
  anchor?: { lat: number; lng: number };
  participants: Array<{
    label: string;
    lat: number;
    lng: number;
  }>;
  final?: Place;
  candidates?: Place[];
  used?: { category: string; radius: number };
}

export interface ShareResponse {
  shareId: string;
  url: string;
}

export interface ShareData {
  anchor?: { lat: number; lng: number };
  participants?: Array<{
    label: string;
    lat: number;
    lng: number;
  }>;
  final?: Place;
  candidates?: Place[];
  used?: { category: string; radius: number };
  user?: {
    nickname: string;
  };
}

// 인증 관련 타입
export interface User {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
}

export interface CreateMeetingRequest {
  final: Place;
  participantCount: number;
  participants: Array<{
    label: string;
    name: string; // 장소 이름
    address?: string; // 장소 주소 (선택적)
  }>;
}

export interface Meeting {
  id: string;
  createdAt: string;
  final: Place;
  participantCount: number;
  participants: Array<{
    label: string;
    name: string; // 장소 이름
    address?: string; // 장소 주소 (선택적)
  }>;
}

export interface CreateFavoriteRequest {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeUrl?: string;
}

// 에러 응답 타입
export interface ApiError {
  error: string;
  code?: string;
}
