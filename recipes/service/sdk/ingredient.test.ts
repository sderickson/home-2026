import { describe, it, expect } from "vitest";
import {
  parseIngredientLine,
  formatIngredient,
  isIngredientHeader,
  getIngredientHeaderText,
  type RecipeIngredient,
} from "./ingredient.ts";

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

  it("parses quantity unit name (any word after quantity is unit)", () => {
    expect(parseIngredientLine("2 cups flour")).toEqual({
      quantity: "2",
      unit: "cups",
      name: "flour",
    });
    expect(parseIngredientLine("1 head cauliflower, trimmed")).toEqual({
      quantity: "1",
      unit: "head",
      name: "cauliflower, trimmed",
    });
  });

  it("combines multi-part quantity (1 1/2, 1.5)", () => {
    expect(parseIngredientLine("1 1/2 cups flour")).toEqual({
      quantity: "1 1/2",
      unit: "cups",
      name: "flour",
    });
    expect(parseIngredientLine("1.5 tsp vanilla")).toEqual({
      quantity: "1.5",
      unit: "tsp",
      name: "vanilla",
    });
  });

  it("parses unicode fraction as quantity", () => {
    expect(parseIngredientLine("½ cup water")).toEqual({
      quantity: "½",
      unit: "cup",
      name: "water",
    });
  });

  it("parses mixed digit + unicode fraction in one token (e.g. 1⅔)", () => {
    expect(parseIngredientLine("1⅔ cups milk")).toEqual({
      quantity: "1⅔",
      unit: "cups",
      name: "milk",
    });
    expect(parseIngredientLine("2½ tsp salt")).toEqual({
      quantity: "2½",
      unit: "tsp",
      name: "salt",
    });
  });

  it("treats any single word after quantity as unit", () => {
    expect(parseIngredientLine("1 1/2 flour")).toEqual({
      quantity: "1 1/2",
      unit: "flour",
      name: "",
    });
  });

  it("treats entire line as name when there is no quantity", () => {
    expect(parseIngredientLine("salt and pepper")).toEqual({
      quantity: "",
      unit: "",
      name: "salt and pepper",
    });
    expect(parseIngredientLine("cauliflower, trimmed and cut into florets")).toEqual({
      quantity: "",
      unit: "",
      name: "cauliflower, trimmed and cut into florets",
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

  it("round-trips with parseIngredientLine", () => {
    const lines = [
      "2 cups flour",
      "1 1/2 tsp vanilla",
      "salt and pepper",
      "½ cup water",
      "1⅔ cups milk",
    ];
    for (const line of lines) {
      const parsed = parseIngredientLine(line);
      expect(formatIngredient(parsed)).toBe(line);
    }
  });
});

describe("ingredient headers", () => {
  it("treats '# Text' lines as headers", () => {
    const ing = parseIngredientLine("# Dough");
    expect(isIngredientHeader(ing)).toBe(true);
    expect(getIngredientHeaderText(ing)).toBe("Dough");
    expect(formatIngredient(ing)).toBe("# Dough");
  });

  it("treats any number of '#' as the same header", () => {
    const ing = parseIngredientLine("### For the sauce");
    expect(isIngredientHeader(ing)).toBe(true);
    expect(getIngredientHeaderText(ing)).toBe("For the sauce");
  });

  it("does not treat '#' without a following space as a header", () => {
    expect(isIngredientHeader(parseIngredientLine("#10 can tomatoes"))).toBe(
      false,
    );
    expect(isIngredientHeader(parseIngredientLine("#"))).toBe(false);
    expect(isIngredientHeader(parseIngredientLine("# "))).toBe(false);
  });

  it("does not treat regular ingredients as headers", () => {
    expect(isIngredientHeader(parseIngredientLine("2 cups flour"))).toBe(
      false,
    );
  });
});
