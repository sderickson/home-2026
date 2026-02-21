import { describe, it, expect } from "vitest";
import {
  assertProfileLoaded,
  assertRecipesLoaded,
  canShowCreateRecipe,
  getRecipesList,
} from "./List.logic.ts";

describe("assertProfileLoaded", () => {
  it("throws when profile is null", () => {
    expect(() => assertProfileLoaded(null)).toThrow("Failed to load profile");
  });

  it("throws when profile is undefined", () => {
    expect(() => assertProfileLoaded(undefined)).toThrow(
      "Failed to load profile",
    );
  });

  it("does not throw when profile is truthy", () => {
    expect(() =>
      assertProfileLoaded({ isAdmin: false, email: "user@example.com" }),
    ).not.toThrow();
  });
});

describe("assertRecipesLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertRecipesLoaded(undefined)).toThrow(
      "Failed to load recipes",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertRecipesLoaded(null)).toThrow("Failed to load recipes");
  });

  it("does not throw when data is an empty array", () => {
    expect(() => assertRecipesLoaded([])).not.toThrow();
  });

  it("does not throw when data is a non-empty array", () => {
    expect(() =>
      assertRecipesLoaded([{ id: "1", title: "Test" }]),
    ).not.toThrow();
  });
});

describe("canShowCreateRecipe", () => {
  it("returns true when profile is admin", () => {
    expect(canShowCreateRecipe({ isAdmin: true })).toBe(true);
  });

  it("returns false when profile is not admin", () => {
    expect(canShowCreateRecipe({ isAdmin: false })).toBe(false);
  });

  it("returns false when isAdmin is undefined", () => {
    expect(canShowCreateRecipe({})).toBe(false);
  });
});

describe("getRecipesList", () => {
  it("returns empty array when data is undefined", () => {
    expect(getRecipesList(undefined)).toEqual([]);
  });

  it("returns the array when data is provided", () => {
    const list = [{ id: "1", title: "A" }];
    expect(getRecipesList(list)).toBe(list);
    expect(getRecipesList(list)).toEqual([{ id: "1", title: "A" }]);
  });
});
