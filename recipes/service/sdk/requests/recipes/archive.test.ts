import { afterEach, describe, it, expect } from "vitest";
import { useQuery } from "@tanstack/vue-query";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useArchiveRecipeMutation } from "./archive.ts";
import { listRecipesQuery } from "./list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { mockRecipes, resetMocks } from "./mocks.ts";
import { mockMenus, resetMocks as resetMenuMocks } from "../menus/mocks.ts";

describe("archiveRecipe", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(() => {
    resetMocks();
    resetMenuMocks();
  });

  it("moves the recipe from the active list to the archived list", async () => {
    const [active, app] = withVueQuery(() =>
      useQuery(listRecipesQuery("my-kitchen")),
    );
    const [archived] = withVueQuery(() =>
      useQuery(listRecipesQuery("my-kitchen", { archived: true })),
    );
    const [mutation] = withVueQuery(() => useArchiveRecipeMutation());
    const id = mockRecipes[0].id;

    await active.refetch();
    expect(active.data.value?.recipes.some((r) => r.id === id)).toBe(true);

    const result = await mutation.mutateAsync({ id, archived: true });
    expect(result.recipe.archivedAt).toEqual(expect.any(String));

    await active.refetch();
    await archived.refetch();
    expect(active.data.value?.recipes.some((r) => r.id === id)).toBe(false);
    expect(archived.data.value?.recipes.map((r) => r.id)).toEqual([id]);
    expect(
      mockMenus.some((m) => m.groupings.some((g) => g.recipeIds.includes(id))),
    ).toBe(false);

    app.unmount();
  });
});
