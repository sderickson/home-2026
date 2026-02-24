import { afterEach, describe, it, expect } from "vitest";
import { filesListRecipesQuery } from "./files-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import {
  mockRecipes,
  mockRecipeFiles,
  resetMocks,
} from "./mocks.ts";

describe("filesListRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns files for a recipe from fake handler", async () => {
    const recipeId = mockRecipes[0].id;
    const expectedFiles = mockRecipeFiles
      .filter((f) => f.recipeId === recipeId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    const [query, app] = withVueQuery(() =>
      useQuery(filesListRecipesQuery(recipeId)),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(Array.isArray(query.data.value)).toBe(true);
    expect(query.data.value).toHaveLength(expectedFiles.length);
    expect(query.data.value?.[0]?.fileOriginalName).toBe(
      expectedFiles[0].fileOriginalName,
    );
    expect(query.data.value?.[0]?.id).toBe(expectedFiles[0].id);

    app.unmount();
  });

  it("returns empty array for recipe with no files", async () => {
    const recipeId = "00000000-0000-0000-0000-000000000099";
    const [query, app] = withVueQuery(() =>
      useQuery(filesListRecipesQuery(recipeId)),
    );

    await query.refetch();
    expect(query.data.value).toEqual([]);

    app.unmount();
  });
});
