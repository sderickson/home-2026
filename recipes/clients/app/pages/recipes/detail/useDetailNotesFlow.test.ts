import { describe, it, expect } from "vitest";
import { computed } from "vue";
import { useDetailNotesFlow } from "./useDetailNotesFlow.ts";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { withVueQuery } from "@saflib/sdk/testing";
import {
  recipesServiceFakeHandlers,
  mockRecipes,
  mockRecipeNotes,
} from "@sderickson/recipes-sdk/fakes";

describe("useDetailNotesFlow", () => {
  setupMockServer(recipesServiceFakeHandlers);

  it("create: submitNewNote adds note and clears form", async () => {
    const recipeId = mockRecipes[0].id;
    const [flow, app] = withVueQuery(() =>
      useDetailNotesFlow(computed(() => recipeId)),
    );

    const countBefore = mockRecipeNotes.filter(
      (n) => n.recipeId === recipeId,
    ).length;

    flow.newNoteBody.value = "New note from composable test";
    flow.newNoteVersionId.value = null;
    await flow.submitNewNote();

    expect(mockRecipeNotes.filter((n) => n.recipeId === recipeId)).toHaveLength(
      countBefore + 1,
    );
    expect(mockRecipeNotes.some((n) => n.body === "New note from composable test")).toBe(true);
    expect(flow.newNoteBody.value).toBe("");
    expect(flow.newNoteVersionId.value).toBeNull();

    app.unmount();
  });

  it("edit: startEditNote then saveEditNote updates note and clears edit state", async () => {
    const recipeId = mockRecipes[0].id;
    const note = mockRecipeNotes.filter((n) => n.recipeId === recipeId)[0];
    const [flow, app] = withVueQuery(() =>
      useDetailNotesFlow(computed(() => recipeId)),
    );

    flow.startEditNote(note);
    expect(flow.editingNoteId.value).toBe(note.id);
    expect(flow.editBody.value).toBe(note.body);

    flow.editBody.value = "Updated body from composable test";
    await flow.saveEditNote(note);

    expect(flow.editingNoteId.value).toBeNull();
    const updated = mockRecipeNotes.find((n) => n.id === note.id);
    expect(updated?.body).toBe("Updated body from composable test");

    app.unmount();
  });

  it("delete: confirmDeleteNote then doDeleteNote removes note and closes dialog", async () => {
    const recipeId = mockRecipes[0].id;
    const note = mockRecipeNotes[mockRecipeNotes.length - 1];
    const noteId = note.id;
    const [flow, app] = withVueQuery(() =>
      useDetailNotesFlow(computed(() => recipeId)),
    );

    flow.confirmDeleteNote(note);
    expect(flow.deleteDialogOpen.value).toBe(true);
    expect(flow.noteToDelete.value?.id).toBe(noteId);

    await flow.doDeleteNote();

    expect(flow.deleteDialogOpen.value).toBe(false);
    expect(flow.noteToDelete.value).toBeNull();
    expect(mockRecipeNotes.some((n) => n.id === noteId)).toBe(false);

    app.unmount();
  });
});
