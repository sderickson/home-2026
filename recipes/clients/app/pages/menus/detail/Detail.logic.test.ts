import { describe, it, expect } from "vitest";
import {
  assertMenuDetailLoaded,
  canEditMenuForRole,
  buildUpdateMenuPayload,
  getSectionIndexForRecipe,
  setRecipeSection,
} from "./Detail.logic.ts";

describe("assertMenuDetailLoaded", () => {
  const validSession = {
    identity: { id: "1", traits: { email: "u@example.com" } },
  };
  const validCollection = { collection: { id: "c1", name: "Kitchen" } };
  const validMembers = { members: [] };
  const validMenuData = { menu: { id: "m1", name: "Dinner" }, recipes: [] };
  const validRecipes = [] as unknown[];

  it("does not throw when all data is valid", () => {
    expect(() =>
      assertMenuDetailLoaded(
        validSession,
        validCollection,
        validMembers,
        validMenuData,
        validRecipes,
      ),
    ).not.toThrow();
  });

  it("throws when session is null", () => {
    expect(() =>
      assertMenuDetailLoaded(
        null,
        validCollection,
        validMembers,
        validMenuData,
        validRecipes,
      ),
    ).toThrow("Failed to load session");
  });

  it("throws when menu data has no menu property", () => {
    expect(() =>
      assertMenuDetailLoaded(
        validSession,
        validCollection,
        validMembers,
        {},
        validRecipes,
      ),
    ).toThrow("Failed to load menu");
  });

  it("throws when recipes data is null", () => {
    expect(() =>
      assertMenuDetailLoaded(
        validSession,
        validCollection,
        validMembers,
        validMenuData,
        null,
      ),
    ).toThrow("Failed to load recipes");
  });
});

describe("canEditMenuForRole", () => {
  it("returns true for owner", () => {
    expect(canEditMenuForRole("owner")).toBe(true);
  });

  it("returns true for editor", () => {
    expect(canEditMenuForRole("editor")).toBe(true);
  });

  it("returns false for viewer", () => {
    expect(canEditMenuForRole("viewer")).toBe(false);
  });

  it("returns false when role is undefined", () => {
    expect(canEditMenuForRole(undefined)).toBe(false);
  });
});

describe("buildUpdateMenuPayload", () => {
  it("trims name and filters empty groupings", () => {
    const payload = buildUpdateMenuPayload(
      {
        name: "  Updated Name  ",
        groupings: [
          { name: "Mains", recipeIds: ["r1"] },
          { name: "  ", recipeIds: [] },
          { name: "Sides", recipeIds: [] },
        ],
      },
      "menu-1",
      "coll-1",
    );
    expect(payload).toEqual({
      id: "menu-1",
      collectionId: "coll-1",
      name: "Updated Name",
      groupings: [
        { name: "Mains", recipeIds: ["r1"] },
        { name: "Sides", recipeIds: [] },
      ],
    });
  });
});

describe("getSectionIndexForRecipe", () => {
  const groupings = [
    { name: "Mains", recipeIds: ["r1", "r2"] },
    { name: "Sides", recipeIds: ["r3"] },
  ];

  it("returns section index when recipe is in that section", () => {
    expect(getSectionIndexForRecipe("r1", groupings)).toBe(0);
    expect(getSectionIndexForRecipe("r2", groupings)).toBe(0);
    expect(getSectionIndexForRecipe("r3", groupings)).toBe(1);
  });

  it("returns -1 when recipe is in no section", () => {
    expect(getSectionIndexForRecipe("r0", groupings)).toBe(-1);
  });

  it("returns first section when recipe appears in multiple (legacy)", () => {
    const multi = [
      { name: "A", recipeIds: ["r1"] },
      { name: "B", recipeIds: ["r1"] },
    ];
    expect(getSectionIndexForRecipe("r1", multi)).toBe(0);
  });
});

describe("setRecipeSection", () => {
  it("moves recipe from one section to another", () => {
    const groupings = [
      { name: "Mains", recipeIds: ["r1", "r2"] },
      { name: "Sides", recipeIds: ["r3"] },
    ];
    setRecipeSection("r1", 1, groupings);
    expect(groupings[0].recipeIds).toEqual(["r2"]);
    expect(groupings[1].recipeIds).toEqual(["r3", "r1"]);
  });

  it("assigns recipe to none when sectionIndex is -1", () => {
    const groupings = [
      { name: "Mains", recipeIds: ["r1"] },
      { name: "Sides", recipeIds: [] },
    ];
    setRecipeSection("r1", -1, groupings);
    expect(groupings[0].recipeIds).toEqual([]);
    expect(groupings[1].recipeIds).toEqual([]);
  });

  it("adds recipe to section when it was in none", () => {
    const groupings = [
      { name: "Mains", recipeIds: ["r1"] },
      { name: "Sides", recipeIds: [] },
    ];
    setRecipeSection("r2", 1, groupings);
    expect(groupings[0].recipeIds).toEqual(["r1"]);
    expect(groupings[1].recipeIds).toEqual(["r2"]);
  });
});
