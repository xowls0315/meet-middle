import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

/** 로그아웃·계정 전환 시 유저별 서버 데이터 캐시 제거 */
export function clearUserQueries(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: queryKeys.favorites.prefix });
  queryClient.removeQueries({ queryKey: queryKeys.meetings.prefix });
}
