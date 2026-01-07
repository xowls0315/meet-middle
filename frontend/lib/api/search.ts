import apiClient from "./apiClient";
import { Place } from "@/types";

/**
 * 장소 자동완성 검색
 * @param query 검색 키워드 (최소 2자)
 * @returns 장소 배열
 */
export async function searchPlaces(query: string): Promise<Place[]> {
  if (query.length < 2) {
    return [];
  }

  const response = await apiClient.get<Place[]>("/search/suggest", {
    params: { q: query },
  });

  return response.data;
}
