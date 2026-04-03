import type { ReturnsError } from "@saflib/monorepo";
import { request } from "../client.ts";
import type { UnsplashClientError } from "../client.ts";
import { isMocked } from "../client.ts";
import type { UnsplashSearchPhotosResponse } from "../types.ts";
import { mockSearch } from "./search.mocks.ts";

export interface SearchParams {
  query: string;
  page?: number;
  per_page?: number;
  order_by?: "relevant" | "latest";
  content_filter?: "low" | "high";
  color?: string;
  orientation?: "landscape" | "portrait" | "squarish";
}

export type SearchResult = UnsplashSearchPhotosResponse;

/**
 * Search Unsplash photos by query.
 * When isMocked, returns mock data; otherwise calls the API.
 */
export async function search(
  params: SearchParams,
): Promise<ReturnsError<SearchResult, UnsplashClientError>> {
  if (isMocked()) {
    return { result: mockSearch() };
  }

  const searchParams = new URLSearchParams();
  searchParams.set("query", params.query);
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.per_page != null)
    searchParams.set("per_page", String(params.per_page));
  if (params.order_by) searchParams.set("order_by", params.order_by);
  if (params.content_filter)
    searchParams.set("content_filter", params.content_filter);
  if (params.color) searchParams.set("color", params.color);
  if (params.orientation)
    searchParams.set("orientation", params.orientation);

  return request<UnsplashSearchPhotosResponse>(
    `/search/photos?${searchParams.toString()}`,
  );
}
