import { describe, it, expect } from "vitest";
import { isRecipeFormValid } from "./RecipeForm.logic.ts";

describe("isRecipeFormValid", () => {
  it("returns false when title is empty", () => {
    expect(
      isRecipeFormValid({ title: "", subtitle: "A brief description" }),
    ).toBe(false);
  });

  it("returns false when subtitle is empty", () => {
    expect(
      isRecipeFormValid({ title: "Recipe title", subtitle: "" }),
    ).toBe(false);
  });

  it("returns true when both are non-empty after trim", () => {
    expect(
      isRecipeFormValid({
        title: "  Recipe title  ",
        subtitle: " Brief description ",
      }),
    ).toBe(true);
  });
});
