import { afterEach, describe, it, expect } from "vitest";
import { sharedGetRecipesQuery } from "./shared-get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import {
  mockRecipes,
  mockRecipeFiles,
  resetMocks,
} from "./mocks.ts";

describe("sharedGetRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns recipe, currentVersion, and files for known id", async () => {
    const id = mockRecipes[0].id;
    const expectedFiles = mockRecipeFiles.filter((f) => f.recipeId === id);
    const [query, app] = withVueQuery(() =>
      useQuery(sharedGetRecipesQuery(id)),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(query.data.value?.recipe.id).toBe(id);
    expect(query.data.value?.recipe.title).toBe(mockRecipes[0].title);
    expect(query.data.value?.currentVersion).toBeDefined();
    expect(query.data.value?.currentVersion.recipeId).toBe(id);
    expect(query.data.value?.files).toHaveLength(expectedFiles.length);
    expect(query.data.value?.files[0]?.downloadUrl).toBe(
      `/recipes/${id}/shared/files/${expectedFiles[0].id}/blob`,
    );

    app.unmount();
  });

  it("returns expected shape with shared blob downloadUrls", async () => {
    const id = mockRecipes[1].id;
    const [query, app] = withVueQuery(() =>
      useQuery(sharedGetRecipesQuery(id)),
    );

    await query.refetch();
    const data = query.data.value;
    expect(data).toBeDefined();
    expect(data).toHaveProperty("recipe");
    expect(data).toHaveProperty("currentVersion");
    expect(data).toHaveProperty("files");
    expect(data?.recipe).toMatchObject({ id, title: expect.any(String) });
    expect(data?.currentVersion).toMatchObject({
      id: expect.any(String),
      recipeId: id,
      content: expect.any(Object),
    });
    for (const file of data?.files ?? []) {
      expect(file.downloadUrl).toBe(
        `/recipes/${id}/shared/files/${file.id}/blob`,
      );
      expect(file.downloadUrl).not.toMatch(
        new RegExp(`/recipes/${id}/files/`),
      );
    }

    app.unmount();
  });
});
