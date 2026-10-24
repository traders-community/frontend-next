/**
 * Next.js Data Cache tags attached to server-side fetches.
 * The backend purges them through POST /api/revalidate after admin mutations
 * (see backend/utils/revalidate.js), so public pages refresh without waiting for ISR.
 */
export const CACHE_TAGS = {
  blogs: "blogs",
  categories: "categories",
  products: "products",
  settings: "settings",
  profile: "profile",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
