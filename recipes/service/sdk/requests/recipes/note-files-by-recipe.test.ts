import { describe, it, expect, beforeEach } from "vitest";
import { useQuery } from "@tanstack/vue-query";
import { recipeNoteFilesGetByNoteIdQuery } from "./note-files-by-recipe.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { mockRecipes, mockRecipeNotes, mockRecipeNoteFiles, resetMocks } from "./mocks.ts";

describe("recipeNoteFilesGetByNoteIdQuery", () => {
  setupMockServer(recipesServiceFakeHandlers);
  beforeEach(resetMocks);

  it("returns note files for the recipe", async () => {
    const recipeId = mockRecipes[0].id;
    const [query] = withVueQuery(() =>
      useQuery(recipeNoteFilesGetByNoteIdQuery(recipeId)),
    );

    await query.refetch();

    expect(query.data.value).toBeDefined();
    const files = query.data.value ?? [];
    const noteIds = new Set(mockRecipeNotes.filter((n) => n.recipeId === recipeId).map((n) => n.id));
    expect(files.every((f) => noteIds.has(f.recipeNoteId))).toBe(true);
    expect(files.length).toBe(
      mockRecipeNoteFiles.filter((f) => noteIds.has(f.recipeNoteId)).length,
    );
  });
});
