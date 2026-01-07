import apiClient from "./apiClient";
import { CreateMeetingRequest, Meeting } from "@/types";

/**
 * 약속 기록 생성
 * @param data 기록 데이터
 * @returns 생성된 기록
 */
export async function createMeeting(data: CreateMeetingRequest): Promise<Meeting> {
  const response = await apiClient.post<Meeting>("/meetings", data);
  return response.data;
}

/**
 * 약속 기록 목록 조회
 * @returns 기록 배열
 */
export async function getMeetings(): Promise<Meeting[]> {
  const response = await apiClient.get<Meeting[]>("/meetings");
  return response.data;
}

/**
 * 약속 기록 삭제
 * @param id 기록 ID
 */
export async function deleteMeeting(id: string): Promise<void> {
  await apiClient.delete(`/meetings/${id}`);
}
