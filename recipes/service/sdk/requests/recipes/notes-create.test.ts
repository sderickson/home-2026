import { describe, it, expect } from "vitest";
import { useNotesCreateRecipesMutation } from "./notes-create.ts";
import { notesListRecipesQuery } from "./notes-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, mockRecipeNotes } from "./mocks.ts";

describe("notesCreateRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);

  it("succeeds and returns the created note", async () => {
    const [mutation, app] = withVueQuery(() =>
      useNotesCreateRecipesMutation(),
    );
    const recipeId = mockRecipes[0].id;
    const initialCount = mockRecipeNotes.filter(
      (n) => n.recipeId === recipeId,
    ).length;

    const result = await mutation.mutateAsync({
      id: recipeId,
      body: "Test note from create mutation",
    });

    expect(result).toBeDefined();
    expect(result.recipeId).toBe(recipeId);
    expect(result.body).toBe("Test note from create mutation");
    expect(result.everEdited).toBe(false);
    expect(mockRecipeNotes.filter((n) => n.recipeId === recipeId)).toHaveLength(
      initialCount + 1,
    );
    expect(mockRecipeNotes.some((n) => n.id === result.id)).toBe(true);

    app.unmount();
  });

  it("invalidates related queries so notes list reflects the new note", async () => {
    const recipeId = mockRecipes[0].id;
    const [notesQuery, app] = withVueQuery(() =>
      useQuery(notesListRecipesQuery(recipeId)),
    );
    const [mutation] = withVueQuery(() => useNotesCreateRecipesMutation());

    await notesQuery.refetch();
    const countBefore = notesQuery.data.value?.length ?? 0;

    const result = await mutation.mutateAsync({
      id: recipeId,
      body: "Cache invalidation test note",
    });

    await notesQuery.refetch();
    const countAfter = notesQuery.data.value?.length ?? 0;
    expect(countAfter).toBe(countBefore + 1);
    expect(notesQuery.data.value?.some((n) => n.id === result.id)).toBe(true);
    expect(
      notesQuery.data.value?.some((n) => n.body === "Cache invalidation test note"),
    ).toBe(true);

    app.unmount();
  });
});
