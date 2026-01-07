import apiClient from "./apiClient";
import { CreateFavoriteRequest, Place } from "@/types";

/**
 * 즐겨찾기 추가
 * @param data 즐겨찾기 데이터
 * @returns 추가된 즐겨찾기
 */
export async function createFavorite(data: CreateFavoriteRequest): Promise<Place> {
  const response = await apiClient.post<Place>("/favorites", data);
  return response.data;
}

/**
 * 즐겨찾기 목록 조회
 * @returns 즐겨찾기 배열
 */
export async function getFavorites(): Promise<Place[]> {
  const response = await apiClient.get<Place[]>("/favorites");
  return response.data;
}

/**
 * 즐겨찾기 삭제
 * @param placeId 카카오 장소 ID
 */
export async function deleteFavorite(placeId: string): Promise<void> {
  await apiClient.delete(`/favorites/${placeId}`);
}
