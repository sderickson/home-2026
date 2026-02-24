import { afterEach, describe, it, expect } from "vitest";
import { useFilesDeleteRecipesMutation } from "./files-delete.ts";
import { filesListRecipesQuery } from "./files-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipeFiles, resetMocks } from "./mocks.ts";

describe("filesDeleteRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and removes the file from mock data", async () => {
    const [mutation, app] = withVueQuery(() =>
      useFilesDeleteRecipesMutation(),
    );
    const file = mockRecipeFiles[mockRecipeFiles.length - 1];
    const recipeId = file.recipeId;
    const fileId = file.id;
    const countBefore = mockRecipeFiles.filter(
      (f) => f.recipeId === recipeId,
    ).length;

    await mutation.mutateAsync({ recipeId, fileId });

    expect(mockRecipeFiles.some((f) => f.id === fileId)).toBe(false);
    expect(mockRecipeFiles.filter((f) => f.recipeId === recipeId)).toHaveLength(
      countBefore - 1,
    );

    app.unmount();
  });

  it("invalidates related queries so files list reflects the deletion", async () => {
    const file = mockRecipeFiles[mockRecipeFiles.length - 1];
    const recipeId = file.recipeId;
    const fileId = file.id;
    const [filesQuery, app] = withVueQuery(() =>
      useQuery(filesListRecipesQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() => useFilesDeleteRecipesMutation());

    await filesQuery.refetch();
    const countBefore = filesQuery.data.value?.length ?? 0;

    await mutation.mutateAsync({ recipeId, fileId });

    await filesQuery.refetch();
    const countAfter = filesQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore - 1);
    expect(filesQuery.data.value?.some((f) => f.id === fileId)).toBe(false);

    app.unmount();
  });
});
