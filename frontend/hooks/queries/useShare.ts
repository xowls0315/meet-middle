import { useQuery } from "@tanstack/react-query";
import { getShare } from "@/lib/api/share";
import { queryKeys } from "./keys";

export function useShare(shareId: string) {
  return useQuery({
    queryKey: queryKeys.share.detail(shareId),
    queryFn: () => getShare(shareId),
    enabled: !!shareId,
  });
}
