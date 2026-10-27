import { describe, expect, it } from "vitest";
import {
  addRecipeToGroupings,
  defaultSectionFor,
  isPlacementComplete,
  isRecipeOnAnyMenu,
  menusContainingRecipe,
} from "./menuPlacement.logic.ts";

const groupings = [
  { name: "Mains", recipeIds: ["a"] },
  { name: "Desserts", recipeIds: [] },
];

describe("addRecipeToGroupings", () => {
  it("appends to an existing section, matching loosely", () => {
    expect(addRecipeToGroupings(groupings, " mains ", "b")).toEqual([
      { name: "Mains", recipeIds: ["a", "b"] },
      { name: "Desserts", recipeIds: [] },
    ]);
  });

  it("adds a new section at the end", () => {
    expect(addRecipeToGroupings(groupings, "Sides ", "b")).toEqual([
      ...groupings,
      { name: "Sides", recipeIds: ["b"] },
    ]);
  });

  it("doesn't duplicate a recipe already in the section", () => {
    expect(addRecipeToGroupings(groupings, "Mains", "a")).toEqual(groupings);
  });
});

describe("isRecipeOnAnyMenu", () => {
  it("finds the recipe in any section of any menu", () => {
    expect(isRecipeOnAnyMenu([{ groupings }], "a")).toBe(true);
    expect(isRecipeOnAnyMenu([{ groupings }], "z")).toBe(false);
    expect(isRecipeOnAnyMenu([], "a")).toBe(false);
  });
});

describe("isPlacementComplete", () => {
  it("needs a menu and a section", () => {
    expect(isPlacementComplete({ menuId: "m", section: "Mains" })).toBe(true);
    expect(isPlacementComplete({ menuId: null, section: "Mains" })).toBe(false);
    expect(isPlacementComplete({ menuId: "m", section: "  " })).toBe(false);
  });
});

describe("defaultSectionFor", () => {
  it("uses the first section", () => {
    expect(defaultSectionFor({ groupings })).toBe("Mains");
    expect(defaultSectionFor({ groupings: [] })).toBe("");
    expect(defaultSectionFor(undefined)).toBe("");
  });
});

describe("menusContainingRecipe", () => {
  it("keeps only the menus that list the recipe", () => {
    const weeknights = { id: "w", groupings };
    const brunch = { id: "b", groupings: [{ name: "Eggs", recipeIds: ["z"] }] };
    expect(menusContainingRecipe([weeknights, brunch], "a")).toEqual([
      weeknights,
    ]);
    expect(menusContainingRecipe([weeknights, brunch], "q")).toEqual([]);
  });
});
