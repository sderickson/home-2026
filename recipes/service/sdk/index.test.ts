import { describe, expect, it } from "vitest";
import { sharedGetRecipesQuery } from "@sderickson/recipes-sdk/requests/recipes/shared-get";

describe("@sderickson/recipes-sdk", () => {
  it("exposes request modules via subpath exports", () => {
    expect(typeof sharedGetRecipesQuery).toBe("function");
  });
});
