import { afterEach, describe, it, expect } from "vitest";
import { useUpdateRecipeMutation } from "./update.ts";
import { getRecipeQuery } from "./get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, resetMocks } from "./mocks.ts";

describe("updateRecipe", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the updated recipe", async () => {
    const [mutation, app] = withVueQuery(() => useUpdateRecipeMutation());
    const id = mockRecipes[0].id;

    const result = await mutation.mutateAsync({
      id,
      title: "Updated Title",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(id);
    expect(result.title).toBe("Updated Title");
    expect(mockRecipes[0].title).toBe("Updated Title");

    app.unmount();
  });

  it("invalidates related queries so get-by-id reflects the update", async () => {
    const id = mockRecipes[1].id;
    const [getQuery, app] = withVueQuery(() =>
      useQuery(getRecipeQuery(id)),
    );
    const [mutation] = withVueQuery(() => useUpdateRecipeMutation());

    await getQuery.refetch();
    expect(getQuery.data.value?.recipe.title).toBe("Simple Salad");

    await mutation.mutateAsync({
      id,
      title: "Renamed Salad",
      isPublic: true,
    });

    await getQuery.refetch();
    expect(getQuery.data.value?.recipe.title).toBe("Renamed Salad");
    expect(getQuery.data.value?.recipe.isPublic).toBe(true);

    app.unmount();
  });
});
