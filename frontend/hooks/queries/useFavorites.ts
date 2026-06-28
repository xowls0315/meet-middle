import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFavorite, deleteFavorite, getFavorites } from "@/lib/api/favorites";
import { CreateFavoriteRequest } from "@/types";
import { queryKeys } from "./keys";

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.favorites.all(userId!),
    queryFn: getFavorites,
    enabled: !!userId,
  });
}

export function useCreateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFavoriteRequest) => createFavorite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.prefix });
    },
  });
}

export function useDeleteFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.prefix });
    },
  });
}
