import apiClient from "./apiClient";
import { RecommendRequest, RecommendResponse } from "@/types";

/**
 * 중간 지점 추천
 * @param request 참가자 정보
 * @returns 추천 결과
 */
export async function recommend(request: RecommendRequest): Promise<RecommendResponse> {
  const response = await apiClient.post<RecommendResponse>("/recommend", request);
  return response.data;
}
