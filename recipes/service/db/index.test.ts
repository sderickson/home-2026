import { describe, expect, it } from "vitest";
import { getByIdRecipe } from "@sderickson/recipes-db/queries/recipe/get-by-id";
import { recipesDb } from "@sderickson/recipes-db/instances";

describe("@sderickson/recipes-db", () => {
  it("exposes query modules and instances via subpath exports", () => {
    expect(typeof getByIdRecipe).toBe("function");
    expect(recipesDb).toBeDefined();
  });
});
