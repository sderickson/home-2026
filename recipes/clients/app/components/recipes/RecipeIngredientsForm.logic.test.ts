import { describe, it, expect } from "vitest";
import {
  parseIngredientLine,
  formatIngredient,
  type RecipeIngredient,
} from "./RecipeIngredientsForm.logic.ts";

describe("parseIngredientLine", () => {
  it("returns empty ingredient for empty or whitespace string", () => {
    expect(parseIngredientLine("")).toEqual({
      quantity: "",
      unit: "",
      name: "",
    });
    expect(parseIngredientLine("   ")).toEqual({
      quantity: "",
      unit: "",
      name: "",
    });
  });

  it("parses quantity unit name", () => {
    expect(parseIngredientLine("2 cups flour")).toEqual({
      quantity: "2",
      unit: "cups",
      name: "flour",
    });
  });

  it("parses quantity and unit only", () => {
    expect(parseIngredientLine("1 tsp")).toEqual({
      quantity: "1",
      unit: "tsp",
      name: "",
    });
  });

  it("parses quantity only", () => {
    expect(parseIngredientLine("3")).toEqual({
      quantity: "3",
      unit: "",
      name: "",
    });
  });

  it("joins remainder as name", () => {
    expect(parseIngredientLine("1/2 cup all-purpose flour")).toEqual({
      quantity: "1/2",
      unit: "cup",
      name: "all-purpose flour",
    });
  });

  it("trims input", () => {
    expect(parseIngredientLine("  2  cups  flour  ")).toEqual({
      quantity: "2",
      unit: "cups",
      name: "flour",
    });
  });
});

describe("formatIngredient", () => {
  it("joins quantity, unit, and name with spaces", () => {
    const ing: RecipeIngredient = {
      quantity: "2",
      unit: "cups",
      name: "flour",
    };
    expect(formatIngredient(ing)).toBe("2 cups flour");
  });

  it("omits empty parts", () => {
    expect(formatIngredient({ quantity: "1", unit: "", name: "salt" })).toBe(
      "1 salt",
    );
    expect(formatIngredient({ quantity: "", unit: "", name: "" })).toBe("");
  });
});
