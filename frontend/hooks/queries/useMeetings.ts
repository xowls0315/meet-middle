import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMeeting, deleteMeeting, getMeetings } from "@/lib/api/meetings";
import { CreateMeetingRequest } from "@/types";
import { queryKeys } from "./keys";

export function useMeetings(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.meetings.all(userId!),
    queryFn: getMeetings,
    enabled: !!userId,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingRequest) => createMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.prefix });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.prefix });
    },
  });
}
