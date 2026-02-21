import { describe, it, expect } from "vitest";
import { isRecipeFormValid } from "./RecipeForm.logic.ts";

describe("isRecipeFormValid", () => {
  it("returns false when title is empty", () => {
    expect(
      isRecipeFormValid({ title: "", shortDescription: "A brief description" }),
    ).toBe(false);
  });

  it("returns false when shortDescription is empty", () => {
    expect(
      isRecipeFormValid({ title: "Recipe title", shortDescription: "" }),
    ).toBe(false);
  });

  it("returns true when both are non-empty after trim", () => {
    expect(
      isRecipeFormValid({
        title: "  Recipe title  ",
        shortDescription: " Brief description ",
      }),
    ).toBe(true);
  });
});
