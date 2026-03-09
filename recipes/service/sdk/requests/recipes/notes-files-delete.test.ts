import { afterEach, describe, it, expect } from "vitest";
import { useNotesFilesDeleteRecipesMutation } from "./notes-files-delete.ts";
import { notesFilesListRecipesQuery } from "./notes-files-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import {
  mockRecipeNotes,
  mockRecipeNoteFiles,
  resetMocks,
} from "./mocks.ts";

describe("notesFilesDeleteRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and removes the file from mock data", async () => {
    const [mutation, app] = withVueQuery(() =>
      useNotesFilesDeleteRecipesMutation(),
    );
    const file = mockRecipeNoteFiles[0];
    const note = mockRecipeNotes.find((n) => n.id === file.recipeNoteId)!;
    const recipeId = note.recipeId;
    const noteId = file.recipeNoteId;
    const fileId = file.id;
    const countBefore = mockRecipeNoteFiles.filter(
      (f) => f.recipeNoteId === noteId,
    ).length;

    await mutation.mutateAsync({ recipeId, noteId, fileId });

    expect(mockRecipeNoteFiles.some((f) => f.id === fileId)).toBe(false);
    expect(
      mockRecipeNoteFiles.filter((f) => f.recipeNoteId === noteId),
    ).toHaveLength(countBefore - 1);

    app.unmount();
  });

  it("invalidates related queries so note files list reflects the deletion", async () => {
    const file = mockRecipeNoteFiles[0];
    const note = mockRecipeNotes.find((n) => n.id === file.recipeNoteId)!;
    const recipeId = note.recipeId;
    const noteId = file.recipeNoteId;
    const fileId = file.id;
    const [filesQuery, app] = withVueQuery(() =>
      useQuery(notesFilesListRecipesQuery(recipeId, noteId)),
    );
    const [mutation] = withVueQuery(() =>
      useNotesFilesDeleteRecipesMutation(),
    );

    await filesQuery.refetch();
    const countBefore = filesQuery.data.value?.length ?? 0;

    await mutation.mutateAsync({ recipeId, noteId, fileId });

    await filesQuery.refetch();
    const countAfter = filesQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore - 1);
    expect(
      filesQuery.data.value?.some((f) => f.id === fileId),
    ).toBe(false);

    app.unmount();
  });
});
