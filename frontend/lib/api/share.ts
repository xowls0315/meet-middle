import apiClient from "./apiClient";
import { ShareRequest, ShareResponse, ShareData } from "@/types";

/**
 * 공유 링크 생성
 * @param data 공유할 데이터
 * @returns 공유 링크 정보
 */
export async function createShare(data: ShareRequest): Promise<ShareResponse> {
  const response = await apiClient.post<ShareResponse>("/share", { data });
  return response.data;
}

/**
 * 공유 링크 조회
 * @param shareId 공유 ID
 * @returns 공유 데이터
 */
export async function getShare(shareId: string): Promise<ShareData> {
  const response = await apiClient.get<ShareData>(`/share/${shareId}`);
  return response.data;
}
