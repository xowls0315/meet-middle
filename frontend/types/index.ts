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

export interface RecommendResponse {
  anchor?: { lat: number; lng: number };
  final?: Place;
  candidates?: Place[];
  used?: { category: string; radius: number };
}
