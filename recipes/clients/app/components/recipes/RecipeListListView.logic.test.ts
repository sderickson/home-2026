import { describe, it, expect } from "vitest";
import { groupRecipesByInitial } from "./RecipeListListView.logic.ts";

describe("groupRecipesByInitial", () => {
  it("sorts by title and groups under the first letter", () => {
    const groups = groupRecipesByInitial([
      { title: "Waffles" },
      { title: "shakshuka" },
      { title: "Butternut Squash Soup" },
      { title: "Simple Pasta" },
    ]);
    expect(groups).toEqual([
      { letter: "B", recipes: [{ title: "Butternut Squash Soup" }] },
      {
        letter: "S",
        recipes: [{ title: "shakshuka" }, { title: "Simple Pasta" }],
      },
      { letter: "W", recipes: [{ title: "Waffles" }] },
    ]);
  });

  it("puts titles that don't start with a letter under #", () => {
    const groups = groupRecipesByInitial([{ title: "7-Layer Dip" }]);
    expect(groups).toEqual([
      { letter: "#", recipes: [{ title: "7-Layer Dip" }] },
    ]);
  });

  it("returns no groups for no recipes", () => {
    expect(groupRecipesByInitial([])).toEqual([]);
  });
});
