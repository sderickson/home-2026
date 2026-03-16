import type { UnsplashPhotoSearchItem } from "@sderickson/recipes-spec";
import { recipesHandler } from "../../typed-fake.ts";
import { mockUnsplashPhotos, picsumPhotoUrls } from "./mocks.ts";

const defaultPerPage = 10;

/** Build search results keyed by query so each search term gets distinct images. */
function photosForQuery(q: string | undefined, limit: number): UnsplashPhotoSearchItem[] {
  const base = (q ?? "").trim() || "recipe";
  const list: UnsplashPhotoSearchItem[] = [];
  for (let i = 0; i < limit; i++) {
    const seed = limit === 1 ? base : `${base}-${i}`;
    const id = `mock-${base}-${i}`.replace(/\s+/g, "-");
    list.push({
      id,
      ...picsumPhotoUrls(seed),
      downloadLocation: `https://api.unsplash.com/photos/${id}/download`,
    });
  }
  return list;
}

export const searchUnsplashPhotosHandler = recipesHandler({
  verb: "get",
  path: "/unsplash-photos/search",
  status: 200,
  handler: async ({ query }) => {
    const raw = query?.perPage;
    const limit =
      raw != null ? Number(raw) || defaultPerPage : defaultPerPage;
    const q = query?.q;
    const unsplashPhotos =
      q != null && String(q).trim() !== ""
        ? photosForQuery(String(q).trim(), limit)
        : mockUnsplashPhotos.slice(0, limit);
    return { unsplashPhotos };
  },
});
