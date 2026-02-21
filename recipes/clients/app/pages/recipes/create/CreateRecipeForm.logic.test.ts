import { describe, it, expect } from "vitest";
import { isCreateRecipeFormValid } from "./CreateRecipeForm.logic.ts";

describe("isCreateRecipeFormValid", () => {
  it("returns false when title is empty", () => {
    expect(
      isCreateRecipeFormValid({ title: "", shortDescription: "A brief description" }),
    ).toBe(false);
  });

  it("returns false when title is only whitespace", () => {
    expect(
      isCreateRecipeFormValid({ title: "   ", shortDescription: "A brief description" }),
    ).toBe(false);
  });

  it("returns false when shortDescription is empty", () => {
    expect(
      isCreateRecipeFormValid({ title: "Recipe title", shortDescription: "" }),
    ).toBe(false);
  });

  it("returns false when shortDescription is only whitespace", () => {
    expect(
      isCreateRecipeFormValid({ title: "Recipe title", shortDescription: "  \n  " }),
    ).toBe(false);
  });

  it("returns true when both title and shortDescription are non-empty after trim", () => {
    expect(
      isCreateRecipeFormValid({
        title: "  Recipe title  ",
        shortDescription: " Brief description ",
      }),
    ).toBe(true);
  });
});
