import { afterEach, describe, it, expect } from "vitest";
import { useFilesFromUnsplashRecipesMutation } from "./files-from-unsplash.ts";
import { filesListRecipesQuery } from "./files-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, mockRecipeFiles, resetMocks } from "./mocks.ts";

describe("filesFromUnsplashRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the created file info with unsplashAttribution", async () => {
    const [mutation, app] = withVueQuery(() =>
      useFilesFromUnsplashRecipesMutation(),
    );
    const recipeId = mockRecipes[0].id;
    const initialCount = mockRecipeFiles.filter(
      (f) => f.recipeId === recipeId,
    ).length;

    const result = await mutation.mutateAsync({
      recipeId,
      unsplashPhotoId: "mock-photo-1",
      downloadLocation: "https://api.unsplash.com/photos/mock-photo-1/download",
      imageUrl: "https://images.unsplash.com/photo-1/regular",
    });

    expect(result).toBeDefined();
    expect(result.recipeId).toBe(recipeId);
    expect(result.fileOriginalName).toBe("unsplash-mock-photo-1.jpg");
    expect(result.unsplashAttribution).toBeDefined();
    expect(result.unsplashAttribution?.photographerName).toBe("Fake Photographer");
    expect(result.unsplashAttribution?.photographerProfileUrl).toContain("unsplash.com");
    expect(mockRecipeFiles.filter((f) => f.recipeId === recipeId)).toHaveLength(
      initialCount + 1,
    );
    expect(mockRecipeFiles.some((f) => f.id === result.id)).toBe(true);

    app.unmount();
  });

  it("invalidates related queries so files list reflects the new file", async () => {
    const recipeId = mockRecipes[0].id;
    const [filesQuery, app] = withVueQuery(() =>
      useQuery(filesListRecipesQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() =>
      useFilesFromUnsplashRecipesMutation(),
    );

    await filesQuery.refetch();
    const countBefore = filesQuery.data.value?.length ?? 0;

    const result = await mutation.mutateAsync({
      recipeId,
      unsplashPhotoId: "cache-test-photo",
      downloadLocation: "https://api.unsplash.com/photos/cache-test-photo/download",
      imageUrl: "https://images.unsplash.com/photo-cache/regular",
    });

    await filesQuery.refetch();
    const countAfter = filesQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(filesQuery.data.value?.some((f) => f.id === result.id)).toBe(true);

    app.unmount();
  });
});
