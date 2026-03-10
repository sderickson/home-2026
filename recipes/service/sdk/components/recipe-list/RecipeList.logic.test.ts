import { describe, it, expect } from "vitest";
import {
  filterKeyIngredients,
  formatKeyIngredientsDisplay,
  getCardEnrichment,
} from "./RecipeList.logic.ts";

describe("filterKeyIngredients", () => {
  it("returns empty array for empty input", () => {
    expect(filterKeyIngredients([])).toEqual([]);
  });

  it("filters out ingredients whose name contains 'oil' (e.g. sesame oil, olive oil)", () => {
    const ingredients = [
      { name: "sesame oil", quantity: "1", unit: "tsp" },
      { name: "olive oil", quantity: "2", unit: "tbsp" },
      { name: "cauliflower", quantity: "1", unit: "head" },
    ];
    const result = filterKeyIngredients(ingredients);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("cauliflower");
  });

  it("filters out ingredients whose name contains 'garlic' or 'salt'", () => {
    const ingredients = [
      { name: "garlic", quantity: "2", unit: "cloves" },
      { name: "sea salt", quantity: "1", unit: "pinch" },
      { name: "minced garlic", quantity: "1", unit: "tsp" },
      { name: "onion", quantity: "½", unit: "cup" },
    ];
    const result = filterKeyIngredients(ingredients);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("onion");
  });

  it("is case-insensitive", () => {
    const ingredients = [
      { name: "Salt", quantity: "1", unit: "tsp" },
      { name: "SESAME OIL", quantity: "1", unit: "tsp" },
    ];
    expect(filterKeyIngredients(ingredients)).toHaveLength(0);
  });

  it("preserves quantity and unit for kept ingredients", () => {
    const ingredients = [
      { name: "All-purpose flour", quantity: "2", unit: "cups" },
    ];
    const result = filterKeyIngredients(ingredients);
    expect(result[0]).toEqual({
      name: "All-purpose flour",
      quantity: "2",
      unit: "cups",
    });
  });
});

describe("formatKeyIngredientsDisplay", () => {
  it("returns empty string for empty input", () => {
    expect(formatKeyIngredientsDisplay([])).toBe("");
  });

  it("joins names with commas", () => {
    const ingredients = [
      { name: "cauliflower", quantity: "1", unit: "head" },
      { name: "onion", quantity: "½", unit: "cup" },
    ];
    expect(formatKeyIngredientsDisplay(ingredients)).toBe(
      "cauliflower, onion",
    );
  });

  it("uses only the first part of each name (before comma)", () => {
    const ingredients = [
      { name: "garlic, minced", quantity: "1", unit: "clove" },
      { name: "cauliflower, trimmed and cut into florets", quantity: "1", unit: "head" },
    ];
    expect(formatKeyIngredientsDisplay(ingredients)).toBe(
      "garlic, cauliflower",
    );
  });

  it("trims whitespace around first part", () => {
    const ingredients = [
      { name: "  onion , diced  ", quantity: "1", unit: "cup" },
    ];
    expect(formatKeyIngredientsDisplay(ingredients)).toBe("onion");
  });
});

describe("getCardEnrichment", () => {
  it("returns null firstImageUrl and empty keyIngredients when both inputs undefined", () => {
    const out = getCardEnrichment(undefined, undefined);
    expect(out.firstImageUrl).toBeNull();
    expect(out.keyIngredients).toEqual([]);
  });

  it("returns first image downloadUrl when files has an image", () => {
    const files = [
      { mimetype: "application/pdf", downloadUrl: "https://example.com/a.pdf" },
      {
        mimetype: "image/jpeg",
        downloadUrl: "https://example.com/photo.jpg",
      },
    ];
    const out = getCardEnrichment(undefined, files);
    expect(out.firstImageUrl).toBe("https://example.com/photo.jpg");
  });

  it("returns null firstImageUrl when no image in files", () => {
    const files = [
      { mimetype: "application/pdf", downloadUrl: "https://example.com/a.pdf" },
    ];
    const out = getCardEnrichment(undefined, files);
    expect(out.firstImageUrl).toBeNull();
  });

  it("returns keyIngredients from detail with common ingredients filtered", () => {
    const detail = {
      currentVersion: {
        content: {
          ingredients: [
            { name: "salt", quantity: "1", unit: "tsp" },
            { name: "chicken breast", quantity: "2", unit: "pieces" },
          ],
        },
      },
    };
    const out = getCardEnrichment(detail, undefined);
    expect(out.keyIngredients).toHaveLength(1);
    expect(out.keyIngredients[0].name).toBe("chicken breast");
  });

  it("combines first image and key ingredients", () => {
    const detail = {
      currentVersion: {
        content: {
          ingredients: [{ name: "flour", quantity: "2", unit: "cups" }],
        },
      },
    };
    const files = [
      { mimetype: "image/png", downloadUrl: "https://example.com/dish.png" },
    ];
    const out = getCardEnrichment(detail, files);
    expect(out.firstImageUrl).toBe("https://example.com/dish.png");
    expect(out.keyIngredients).toHaveLength(1);
    expect(out.keyIngredients[0].name).toBe("flour");
  });
});
