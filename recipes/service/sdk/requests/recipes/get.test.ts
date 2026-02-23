import { afterEach, describe, it, expect } from "vitest";
import { getRecipeQuery } from "./get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, resetMocks } from "./mocks.ts";

describe("getRecipe", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns recipe and currentVersion for known id", async () => {
    const id = mockRecipes[0].id;
    const [query, app] = withVueQuery(() => useQuery(getRecipeQuery(id)));

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(query.data.value?.recipe.id).toBe(id);
    expect(query.data.value?.recipe.title).toBe(mockRecipes[0].title);
    expect(query.data.value?.currentVersion).toBeDefined();
    expect(query.data.value?.currentVersion.recipeId).toBe(id);

    app.unmount();
  });

  it("returns expected shape (recipe and currentVersion)", async () => {
    const id = mockRecipes[1].id;
    const [query, app] = withVueQuery(() => useQuery(getRecipeQuery(id)));

    await query.refetch();
    const data = query.data.value;
    expect(data).toBeDefined();
    expect(data).toHaveProperty("recipe");
    expect(data).toHaveProperty("currentVersion");
    expect(data?.recipe).toMatchObject({ id, title: expect.any(String) });
    expect(data?.currentVersion).toMatchObject({
      id: expect.any(String),
      recipeId: id,
      content: expect.any(Object),
    });

    app.unmount();
  });
});
