import { afterEach, describe, it, expect } from "vitest";
import { useCreateRecipeMutation } from "./create.ts";
import { listRecipesQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, resetMocks } from "./mocks.ts";

describe("createRecipe", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the created recipe", async () => {
    const [mutation, app] = withVueQuery(() => useCreateRecipeMutation());

    const result = await mutation.mutateAsync({
      title: "New Recipe",
      shortDescription: "A new test recipe",
      isPublic: true,
    });

    expect(result).toBeDefined();
    expect(result.recipe).toBeDefined();
    expect(result.recipe.title).toBe("New Recipe");
    expect(mockRecipes.some((r) => r.id === result.recipe.id)).toBe(true);

    app.unmount();
  });

  it("invalidates related queries so list reflects the new recipe", async () => {
    const [listQuery, app] = withVueQuery(() =>
      useQuery(listRecipesQuery()),
    );
    const [mutation] = withVueQuery(() => useCreateRecipeMutation());

    await listQuery.refetch();
    const countBefore = listQuery.data.value?.length ?? 0;

    await mutation.mutateAsync({
      title: "Cache Test Recipe",
      shortDescription: "For invalidation test",
      isPublic: false,
    });

    await listQuery.refetch();
    const countAfter = listQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(listQuery.data.value?.some((r) => r.title === "Cache Test Recipe")).toBe(true);

    app.unmount();
  });
});
