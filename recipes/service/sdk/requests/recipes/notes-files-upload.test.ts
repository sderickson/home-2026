import { afterEach, describe, it, expect } from "vitest";
import { useNotesFilesUploadRecipesMutation } from "./notes-files-upload.ts";
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

describe("notesFilesUploadRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and returns the created file info", async () => {
    const [mutation, app] = withVueQuery(() =>
      useNotesFilesUploadRecipesMutation(),
    );
    const recipeId = mockRecipes[0].id;
    const noteId = mockRecipeNotes[0].id;
    const initialCount = mockRecipeNoteFiles.filter(
      (f) => f.recipeNoteId === noteId,
    ).length;
    const mockFile = new File(["test content"], "uploaded-file.txt", {
      type: "text/plain",
    });

    const result = await mutation.mutateAsync({
      recipeId,
      noteId,
      file: mockFile,
    });

    expect(result).toBeDefined();
    expect(result.recipeNoteId).toBe(noteId);
    expect(result.fileOriginalName).toBe("uploaded-file");
    expect(
      mockRecipeNoteFiles.filter((f) => f.recipeNoteId === noteId),
    ).toHaveLength(initialCount + 1);
    expect(mockRecipeNoteFiles.some((f) => f.id === result.id)).toBe(true);

    app.unmount();
  });

  it("invalidates related queries so note files list reflects the new file", async () => {
    const recipeId = mockRecipes[0].id;
    const noteId = mockRecipeNotes[0].id;
    const [filesQuery, app] = withVueQuery(() =>
      useQuery(notesFilesListRecipesQuery(recipeId, noteId)),
    );
    const [mutation] = withVueQuery(() =>
      useNotesFilesUploadRecipesMutation(),
    );

    await filesQuery.refetch();
    const countBefore = filesQuery.data.value?.length ?? 0;

    const mockFile = new File(["cache test"], "cache-test.pdf", {
      type: "application/pdf",
    });
    const result = await mutation.mutateAsync({
      recipeId,
      noteId,
      file: mockFile,
    });

    await filesQuery.refetch();
    const countAfter = filesQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(
      filesQuery.data.value?.some((f) => f.id === result.id),
    ).toBe(true);

    app.unmount();
  });
});
