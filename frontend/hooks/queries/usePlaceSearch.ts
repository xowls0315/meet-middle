import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPlaces } from "@/lib/api/search";
import { queryKeys } from "./keys";

export function usePlaceSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery("");
      return;
    }

    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const isDebouncing = query.length >= 2 && query !== debouncedQuery;

  const result = useQuery({
    queryKey: queryKeys.search.place(debouncedQuery),
    queryFn: () => searchPlaces(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  return {
    ...result,
    suggestions: debouncedQuery.length >= 2 ? (result.data ?? []) : [],
    isLoading: isDebouncing || result.isFetching,
  };
}
