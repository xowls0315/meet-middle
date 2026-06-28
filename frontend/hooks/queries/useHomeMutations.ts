import { useMutation } from "@tanstack/react-query";
import { recommend } from "@/lib/api/recommend";
import { createShare } from "@/lib/api/share";
import { RecommendResponse, ShareRequest } from "@/types";
import { useCreateFavorite } from "./useFavorites";
import { useCreateMeeting } from "./useMeetings";

const CATEGORIES = [
  { code: "SW8", name: "지하철역" },
  { code: "CT1", name: "문화시설" },
  { code: "PO3", name: "공공기관" },
  { code: "AT4", name: "관광명소" },
] as const;

export type RecommendParticipant = {
  label: string;
  lat: number;
  lng: number;
};

export type RecommendAllResult = {
  categoryResults: Map<string, RecommendResponse>;
  defaultCategory: string | null;
};

export function useRecommendAll() {
  return useMutation({
    mutationFn: async (participants: RecommendParticipant[]): Promise<RecommendAllResult> => {
      const results = new Map<string, RecommendResponse>();

      await Promise.all(
        CATEGORIES.map(async (category) => {
          try {
            const response = await recommend({
              participants,
              category: category.code,
            });
            results.set(category.code, response);
          } catch (error) {
            console.error(`${category.name} 추천 오류:`, error);
          }
        }),
      );

      const defaultCategory = results.has("SW8") ? "SW8" : results.keys().next().value ?? null;

      return { categoryResults: results, defaultCategory };
    },
  });
}

export function useCreateShareLink() {
  return useMutation({
    mutationFn: (data: ShareRequest) => createShare(data),
  });
}

export function useSaveMeeting() {
  return useCreateMeeting();
}

export function useAddFavorite() {
  return useCreateFavorite();
}

export { CATEGORIES };
