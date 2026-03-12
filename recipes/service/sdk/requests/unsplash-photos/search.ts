import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export interface SearchUnsplashPhotosQueryOptions {
  /** Search query (e.g. recipe title). */
  q: string;
  /** Number of results to return (default 10). */
  perPage?: number;
}

export const searchUnsplashPhotosQuery = (
  options: SearchUnsplashPhotosQueryOptions,
) => {
  const { q, perPage } = options;
  return queryOptions({
    queryKey: ["unsplash-photos", "search", q, perPage],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/unsplash-photos/search", {
          params: { query: { q, perPage } },
        }),
      ),
  });
};
