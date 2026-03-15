import { describe, it, expect } from "vitest";
import { assertEditDataLoaded, recipeToFormModel } from "./Edit.logic.ts";

describe("assertEditDataLoaded", () => {
  it("throws when data is null", () => {
    expect(() => assertEditDataLoaded(null)).toThrow("Failed to load recipe");
  });

  it("throws when data is undefined", () => {
    expect(() => assertEditDataLoaded(undefined)).toThrow("Failed to load recipe");
  });

  it("does not throw when data is getRecipe response", () => {
    const data = {
      recipe: {
        id: "r1",
        title: "Test",
        subtitle: "Short",
        description: null,
        createdBy: "u1",
        createdAt: "",
        updatedBy: "u1",
        updatedAt: "",
        currentVersionId: "v1",
      },
      currentVersion: {
        id: "v1",
        recipeId: "r1",
        content: { ingredients: [], instructionsMarkdown: "" },
        isLatest: true,
        createdBy: "u1",
        createdAt: "",
      },
    };
    expect(() => assertEditDataLoaded(data)).not.toThrow();
  });
});

describe("recipeToFormModel", () => {
  it("maps getRecipe response to form model", () => {
    const response = {
      recipe: {
        id: "r1",
        title: "Title",
        subtitle: "Short",
        description: "Long",
        createdBy: "u1",
        createdAt: "",
        updatedBy: "u1",
        updatedAt: "",
        currentVersionId: "v1",
      },
      currentVersion: {
        id: "v1",
        recipeId: "r1",
        content: {
          ingredients: [{ name: "Flour", quantity: "2", unit: "cups" }],
          instructionsMarkdown: "Mix.",
        },
        isLatest: true,
        createdBy: "u1",
        createdAt: "",
      },
    };
    const model = recipeToFormModel(response);
    expect(model.title).toBe("Title");
    expect(model.subtitle).toBe("Short");
    expect(model.description).toBe("Long");
    expect(model.initialVersion.content.ingredients).toHaveLength(1);
    expect(model.initialVersion.content.ingredients[0].name).toBe("Flour");
    expect(model.initialVersion.content.instructionsMarkdown).toBe("Mix.");
  });
});
