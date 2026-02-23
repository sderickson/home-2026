import { afterEach, describe, it, expect } from "vitest";
import { useDeleteRecipeMutation } from "./delete.ts";
import { listRecipesQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, mockRecipeVersions, resetMocks } from "./mocks.ts";

describe("deleteRecipe", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and removes recipe from mock data", async () => {
    const [mutation, app] = withVueQuery(() => useDeleteRecipeMutation());
    const id = mockRecipes[mockRecipes.length - 1].id;
    const countBefore = mockRecipes.length;

    await mutation.mutateAsync(id);

    expect(mockRecipes).toHaveLength(countBefore - 1);
    expect(mockRecipes.some((r) => r.id === id)).toBe(false);
    expect(mockRecipeVersions.filter((v) => v.recipeId === id)).toHaveLength(0);

    app.unmount();
  });

  it("invalidates related queries so list no longer includes deleted recipe", async () => {
    const [listQuery, app] = withVueQuery(() =>
      useQuery(listRecipesQuery()),
    );
    const [mutation] = withVueQuery(() => useDeleteRecipeMutation());
    const id = mockRecipes[mockRecipes.length - 1].id;

    await listQuery.refetch();
    expect(listQuery.data.value?.some((r) => r.id === id)).toBe(true);

    await mutation.mutateAsync(id);

    await listQuery.refetch();
    expect(listQuery.data.value?.some((r) => r.id === id)).toBe(false);

    app.unmount();
  });
});
