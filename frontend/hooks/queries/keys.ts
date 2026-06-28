export const queryKeys = {
  favorites: {
    all: (userId: string) => ["favorites", userId] as const,
    prefix: ["favorites"] as const,
  },
  meetings: {
    all: (userId: string) => ["meetings", userId] as const,
    prefix: ["meetings"] as const,
  },
  share: {
    detail: (id: string) => ["share", id] as const,
  },
  search: {
    place: (query: string) => ["search", query] as const,
  },
};
