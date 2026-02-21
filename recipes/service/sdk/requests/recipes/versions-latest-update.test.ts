import { describe, it, expect } from "vitest";
import { useUpdateRecipeVersionLatestMutation } from "./versions-latest-update.ts";
import { getRecipeQuery } from "./get.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, mockRecipeVersions } from "./mocks.ts";

describe("updateRecipeVersionLatest", () => {
  setupMockServer(recipesServiceFakeHandlers);

  it("succeeds and returns the updated version", async () => {
    const [mutation, app] = withVueQuery(() =>
      useUpdateRecipeVersionLatestMutation(),
    );
    const recipeId = mockRecipes[0].id;

    const result = await mutation.mutateAsync({
      id: recipeId,
      ingredients: [
        { name: "Flour", quantity: "3", unit: "cups" },
        { name: "Sugar", quantity: "1", unit: "cup" },
      ],
      instructionsMarkdown: "Updated instructions.",
    });

    expect(result).toBeDefined();
    expect(result.recipeId).toBe(recipeId);
    expect(result.content.instructionsMarkdown).toBe("Updated instructions.");
    const version = mockRecipeVersions.find(
      (v) => v.recipeId === recipeId && v.isLatest,
    );
    expect(version?.content.instructionsMarkdown).toBe("Updated instructions.");

    app.unmount();
  });

  it("invalidates related queries so getRecipe reflects updated version content", async () => {
    const recipeId = mockRecipes[1].id;
    const [getQuery, app] = withVueQuery(() =>
      useQuery(getRecipeQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() =>
      useUpdateRecipeVersionLatestMutation(),
    );

    await getQuery.refetch();
    const beforeInstructions =
      getQuery.data.value?.currentVersion.content.instructionsMarkdown ?? "";

    await mutation.mutateAsync({
      id: recipeId,
      ingredients: getQuery.data.value?.currentVersion.content.ingredients ?? [],
      instructionsMarkdown: "New instructions after cache invalidation.",
    });

    await getQuery.refetch();
    expect(getQuery.data.value?.currentVersion.content.instructionsMarkdown).toBe(
      "New instructions after cache invalidation.",
    );
    expect(
      getQuery.data.value?.currentVersion.content.instructionsMarkdown,
    ).not.toBe(beforeInstructions);

    app.unmount();
  });
});
