import { describe, it, expect } from "vitest";
import { useCreateRecipeVersionMutation } from "./versions-create.ts";
import { listRecipeVersionsQuery } from "./versions-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, mockRecipeVersions } from "./mocks.ts";

describe("createRecipeVersion", () => {
  setupMockServer(recipesServiceFakeHandlers);

  it("succeeds and returns the new version", async () => {
    const [mutation, app] = withVueQuery(() =>
      useCreateRecipeVersionMutation(),
    );
    const recipeId = mockRecipes[0].id;
    const initialVersionCount = mockRecipeVersions.filter(
      (v) => v.recipeId === recipeId,
    ).length;

    const result = await mutation.mutateAsync({
      id: recipeId,
      ingredients: [
        { name: "New ingredient", quantity: "1", unit: "cup" },
      ],
      instructionsMarkdown: "Step 1. Step 2.",
    });

    expect(result).toBeDefined();
    expect(result.recipeId).toBe(recipeId);
    expect(result.isLatest).toBe(true);
    expect(result.content.instructionsMarkdown).toBe("Step 1. Step 2.");
    expect(
      mockRecipeVersions.filter((v) => v.recipeId === recipeId),
    ).toHaveLength(initialVersionCount + 1);
    expect(mockRecipes[0].currentVersionId).toBe(result.id);

    app.unmount();
  });

  it("invalidates related queries so versions list reflects the new version", async () => {
    const recipeId = mockRecipes[1].id;
    const [versionsQuery, app] = withVueQuery(() =>
      useQuery(listRecipeVersionsQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() => useCreateRecipeVersionMutation());

    await versionsQuery.refetch();
    const countBefore = versionsQuery.data.value?.length ?? 0;

    const result = await mutation.mutateAsync({
      id: recipeId,
      ingredients: [{ name: "Salt", quantity: "1", unit: "pinch" }],
      instructionsMarkdown: "Cache test version.",
    });

    await versionsQuery.refetch();
    const countAfter = versionsQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(versionsQuery.data.value?.some((v) => v.id === result.id)).toBe(
      true,
    );
    expect(
      versionsQuery.data.value?.some(
        (v) => v.content.instructionsMarkdown === "Cache test version.",
      ),
    ).toBe(true);

    app.unmount();
  });
});
