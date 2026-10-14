import { describe, it, expect } from "vitest";
import { assertSharedRecipeLoaded } from "./Recipes.logic.ts";

describe("assertSharedRecipeLoaded", () => {
  it("does not throw when data is present", () => {
    expect(() =>
      assertSharedRecipeLoaded({ recipe: { id: "1" } }),
    ).not.toThrow();
  });

  it("throws when data is missing", () => {
    expect(() => assertSharedRecipeLoaded(undefined)).toThrow(
      "Failed to load shared recipe",
    );
    expect(() => assertSharedRecipeLoaded(null)).toThrow(
      "Failed to load shared recipe",
    );
  });
});
