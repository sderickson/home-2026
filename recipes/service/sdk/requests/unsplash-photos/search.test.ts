import { afterEach, describe, it, expect } from "vitest";
import { searchUnsplashPhotosQuery } from "./search.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockUnsplashPhotos, resetMocks } from "./mocks.ts";

describe("searchUnsplashPhotos", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns unsplashPhotos from fake handler", async () => {
    const [query, app] = withVueQuery(() =>
      useQuery(searchUnsplashPhotosQuery({ q: "recipe" })),
    );

    await query.refetch();

    expect(query.data.value).toBeDefined();
    expect(query.data.value).toHaveProperty("unsplashPhotos");
    expect(Array.isArray(query.data.value?.unsplashPhotos)).toBe(true);
    expect(query.data.value!.unsplashPhotos.length).toBeGreaterThan(0);
    expect(query.data.value!.unsplashPhotos[0]).toMatchObject({
      id: expect.any(String),
      thumbUrl: expect.any(String),
      regularUrl: expect.any(String),
      downloadLocation: expect.any(String),
    });

    app.unmount();
  });

  it("respects perPage query parameter", async () => {
    const [query, app] = withVueQuery(() =>
      useQuery(searchUnsplashPhotosQuery({ q: "salad", perPage: 2 })),
    );

    await query.refetch();

    expect(query.data.value).toBeDefined();
    expect(query.data.value!.unsplashPhotos).toHaveLength(2);
    expect(query.data.value!.unsplashPhotos[0].id).toBe("mock-salad-0");
    expect(query.data.value!.unsplashPhotos[1].id).toBe("mock-salad-1");

    app.unmount();
  });
});
