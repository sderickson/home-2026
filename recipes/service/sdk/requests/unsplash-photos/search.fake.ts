import { recipesHandler } from "../../typed-fake.ts";
import { mockUnsplashPhotos } from "./mocks.ts";

const defaultPerPage = 10;

export const searchUnsplashPhotosHandler = recipesHandler({
  verb: "get",
  path: "/unsplash-photos/search",
  status: 200,
  handler: async ({ query }) => {
    const raw = query?.perPage;
    const limit =
      raw != null ? Number(raw) || defaultPerPage : defaultPerPage;
    const unsplashPhotos = mockUnsplashPhotos.slice(0, limit);
    return { unsplashPhotos };
  },
});
