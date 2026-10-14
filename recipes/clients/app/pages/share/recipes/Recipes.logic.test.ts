import { describe, it, expect } from "vitest";
import { TanstackError } from "@saflib/sdk";
import {
  assertSharedRecipeLoaded,
  isSharedRecipeNotFound,
} from "./Recipes.logic.ts";

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

describe("isSharedRecipeNotFound", () => {
  it("returns true for 404 TanstackError", () => {
    expect(isSharedRecipeNotFound(new TanstackError(404))).toBe(true);
  });

  it('returns true for "No data returned" fake-handler errors', () => {
    expect(
      isSharedRecipeNotFound(new TanstackError(500, "No data returned")),
    ).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isSharedRecipeNotFound(new TanstackError(500))).toBe(false);
    expect(isSharedRecipeNotFound(new Error("boom"))).toBe(false);
    expect(isSharedRecipeNotFound(undefined)).toBe(false);
  });
});
