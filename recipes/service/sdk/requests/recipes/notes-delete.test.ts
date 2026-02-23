import { afterEach, describe, it, expect } from "vitest";
import { useNotesDeleteRecipesMutation } from "./notes-delete.ts";
import { notesListRecipesQuery } from "./notes-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipeNotes, resetMocks } from "./mocks.ts";

describe("notesDeleteRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("succeeds and removes the note from mock data", async () => {
    const [mutation, app] = withVueQuery(() =>
      useNotesDeleteRecipesMutation(),
    );
    const note = mockRecipeNotes[mockRecipeNotes.length - 1];
    const recipeId = note.recipeId;
    const noteId = note.id;
    const countBefore = mockRecipeNotes.filter(
      (n) => n.recipeId === recipeId,
    ).length;

    await mutation.mutateAsync({ id: recipeId, noteId });

    expect(mockRecipeNotes.some((n) => n.id === noteId)).toBe(false);
    expect(mockRecipeNotes.filter((n) => n.recipeId === recipeId)).toHaveLength(
      countBefore - 1,
    );

    app.unmount();
  });

  it("invalidates related queries so notes list reflects the deletion", async () => {
    const note = mockRecipeNotes[mockRecipeNotes.length - 1];
    const recipeId = note.recipeId;
    const noteId = note.id;
    const [notesQuery, app] = withVueQuery(() =>
      useQuery(notesListRecipesQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() => useNotesDeleteRecipesMutation());

    await notesQuery.refetch();
    const countBefore = notesQuery.data.value?.length ?? 0;

    await mutation.mutateAsync({ id: recipeId, noteId });

    await notesQuery.refetch();
    const countAfter = notesQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore - 1);
    expect(notesQuery.data.value?.some((n) => n.id === noteId)).toBe(false);

    app.unmount();
  });
});
