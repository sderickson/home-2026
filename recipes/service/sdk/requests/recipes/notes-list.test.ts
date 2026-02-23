import { afterEach, describe, it, expect } from "vitest";
import { notesListRecipesQuery } from "./notes-list.ts";
import { recipesServiceFakeHandlers } from "../../fakes.ts";
import { withVueQuery } from "@saflib/sdk/testing";
import { setupMockServer } from "@saflib/sdk/testing/mock";
import { useQuery } from "@tanstack/vue-query";
import { mockRecipes, mockRecipeNotes, resetMocks } from "./mocks.ts";

describe("notesListRecipes", () => {
  setupMockServer(recipesServiceFakeHandlers);
  afterEach(resetMocks);

  it("returns notes for a recipe from fake handler", async () => {
    const recipeId = mockRecipes[0].id;
    const expectedNotes = mockRecipeNotes.filter((n) => n.recipeId === recipeId);

    const [query, app] = withVueQuery(() =>
      useQuery(notesListRecipesQuery(recipeId)),
    );

    await query.refetch();
    expect(query.data.value).toBeDefined();
    expect(Array.isArray(query.data.value)).toBe(true);
    expect(query.data.value).toHaveLength(expectedNotes.length);
    expect(query.data.value?.[0]?.body).toBe(expectedNotes[0].body);

    app.unmount();
  });

  it("returns empty array for recipe with no notes", async () => {
    const recipeId = "00000000-0000-0000-0000-000000000099";
    const [query, app] = withVueQuery(() =>
      useQuery(notesListRecipesQuery(recipeId)),
    );

    await query.refetch();
    expect(query.data.value).toEqual([]);

    app.unmount();
  });
});
