import { describe, it, expect } from "vitest";
import { assertRecipeLoaded } from "./Detail.logic.ts";

describe("assertRecipeLoaded", () => {
  it("throws when data is undefined", () => {
    expect(() => assertRecipeLoaded(undefined)).toThrow(
      "Failed to load recipe",
    );
  });

  it("throws when data is null", () => {
    expect(() => assertRecipeLoaded(null)).toThrow("Failed to load recipe");
  });

  it("does not throw when data is truthy", () => {
    expect(() =>
      assertRecipeLoaded({ recipe: {}, currentVersion: {} }),
    ).not.toThrow();
  });
});
