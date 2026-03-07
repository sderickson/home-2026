import { afterEach, describe, it, expect } from "vitest";
import { useFilesUploadRecipesMutation } from "./files-upload.ts";
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

describe("filesUploadRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the created file info", async () => {
    const [mutation, app] = withVueQuery(() =>
      useFilesUploadRecipesMutation(),
    );
    const recipeId = mockRecipes[0].id;
    const initialCount = mockRecipeFiles.filter(
      (f) => f.recipeId === recipeId,
    ).length;
    const mockFile = new File(["test content"], "uploaded-file.txt", {
      type: "text/plain",
    });

    const result = await mutation.mutateAsync({ recipeId, file: mockFile });

    expect(result).toBeDefined();
    expect(result.recipeId).toBe(recipeId);
    expect(result.fileOriginalName).toBe("uploaded-file");
    expect(mockRecipeFiles.filter((f) => f.recipeId === recipeId)).toHaveLength(
      initialCount + 1,
    );
    expect(mockRecipeFiles.some((f) => f.id === result.id)).toBe(true);

    app.unmount();
  });

  it("invalidates related queries so files list reflects the new file", async () => {
    const recipeId = mockRecipes[0].id;
    const [filesQuery, app] = withVueQuery(() =>
      useQuery(filesListRecipesQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() => useFilesUploadRecipesMutation());

    await filesQuery.refetch();
    const countBefore = filesQuery.data.value?.length ?? 0;

    const mockFile = new File(["cache test"], "cache-test.pdf", {
      type: "application/pdf",
    });
    const result = await mutation.mutateAsync({ recipeId, file: mockFile });

    await filesQuery.refetch();
    const countAfter = filesQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(filesQuery.data.value?.some((f) => f.id === result.id)).toBe(true);

    app.unmount();
  });
});
