import { describe, it, expect } from "vitest";
import { useNotesUpdateRecipesMutation } from "./notes-update.ts";
import { notesListRecipesQuery } from "./notes-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipeNotes } from "./mocks.ts";

describe("notesUpdateRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);

  it("succeeds and returns the updated note", async () => {
    const [mutation, app] = withVueQuery(() =>
      useNotesUpdateRecipesMutation(),
    );
    const note = mockRecipeNotes[0];
    const newBody = "Updated note body from mutation";

    const result = await mutation.mutateAsync({
      id: note.recipeId,
      noteId: note.id,
      body: newBody,
    });

    expect(result).toBeDefined();
    expect(result.body).toBe(newBody);
    expect(result.everEdited).toBe(true);
    expect(note.body).toBe(newBody);
    expect(note.everEdited).toBe(true);

    app.unmount();
  });

  it("invalidates related queries so notes list reflects the update", async () => {
    const note = mockRecipeNotes[1];
    const recipeId = note.recipeId;
    const [notesQuery, app] = withVueQuery(() =>
      useQuery(notesListRecipesQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() => useNotesUpdateRecipesMutation());

    await notesQuery.refetch();
    const updatedBody = "Cache invalidation update test body";

    await mutation.mutateAsync({
      id: recipeId,
      noteId: note.id,
      body: updatedBody,
    });

    await notesQuery.refetch();
    const found = notesQuery.data.value?.find((n) => n.id === note.id);
    expect(found?.body).toBe(updatedBody);
    expect(found?.everEdited).toBe(true);

    app.unmount();
  });
});
