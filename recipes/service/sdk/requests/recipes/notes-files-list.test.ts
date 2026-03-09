import { afterEach, describe, it, expect } from "vitest";
import { notesFilesListRecipesQuery } from "./notes-files-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import {
  mockRecipes,
  mockRecipeNotes,
  mockRecipeNoteFiles,
  resetMocks,
} from "./mocks.ts";

describe("notesFilesListRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns files for a note from fake handler", async () => {
    const recipeId = mockRecipes[0].id;
    const noteId = mockRecipeNotes[0].id;
    const expectedFiles = mockRecipeNoteFiles
      .filter((f) => f.recipeNoteId === noteId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    const [query, app] = withVueQuery(() =>
      useQuery(notesFilesListRecipesQuery(recipeId, noteId)),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(Array.isArray(query.data.value)).toBe(true);
    expect(query.data.value).toHaveLength(expectedFiles.length);
    expect(query.data.value?.[0]?.fileOriginalName).toBe(
      expectedFiles[0].fileOriginalName,
    );
    expect(query.data.value?.[0]?.id).toBe(expectedFiles[0].id);

    app.unmount();
  });

  it("returns empty array for note with no files", async () => {
    const recipeId = mockRecipes[0].id;
    const noteId = mockRecipeNotes[2].id;

    const [query, app] = withVueQuery(() =>
      useQuery(notesFilesListRecipesQuery(recipeId, noteId)),
    );

    await query.refetch();
    expect(query.data.value).toEqual([]);

    app.unmount();
  });
});
