import { describe, it, expect } from "vitest";
import type {
  Recipe,
  RecipeFileInfo,
  RecipeVersion,
} from "@sderickson/recipes-spec";
import { assertSharedMenuLoaded, sharedMenuDisplayData } from "./Menus.logic.ts";

const recipe = (id: string, title: string, subtitle = ""): Recipe =>
  ({ id, title, subtitle }) as Recipe;

const version = (
  recipeId: string,
  ingredients: { name: string; quantity: string; unit: string }[],
): RecipeVersion =>
  ({
    id: `v-${recipeId}`,
    recipeId,
    content: { ingredients, instructionsMarkdown: "" },
  }) as RecipeVersion;

describe("assertSharedMenuLoaded", () => {
  it("throws when data is missing", () => {
    expect(() => assertSharedMenuLoaded(undefined)).toThrow(
      "Failed to load shared menu",
    );
    expect(() => assertSharedMenuLoaded({ menu: {} })).not.toThrow();
  });
});

describe("sharedMenuDisplayData", () => {
  it("uses the subtitle, or key ingredients when there is none", () => {
    const { recipeById, subtextByRecipeId } = sharedMenuDisplayData({
      recipes: [recipe("a", "Soup", "Warming"), recipe("b", "Stew")],
      currentVersions: [
        version("a", [{ name: "leeks", quantity: "2", unit: "" }]),
        version("b", [
          { name: "beef chuck, cubed", quantity: "2", unit: "lb" },
          { name: "salt", quantity: "1", unit: "tsp" },
          { name: "carrots", quantity: "3", unit: "" },
        ]),
      ],
      files: [],
    });
    expect(recipeById.get("b")?.title).toBe("Stew");
    expect(subtextByRecipeId.get("a")).toBe("Warming");
    expect(subtextByRecipeId.get("b")).toBe("beef chuck, carrots");
  });

  it("picks each recipe's first image", () => {
    const files = [
      { id: "f1", recipeId: "a", mimetype: "application/pdf", downloadUrl: "/pdf" },
      { id: "f2", recipeId: "a", mimetype: "image/jpeg", downloadUrl: "/a.jpg" },
      { id: "f3", recipeId: "b", mimetype: "image/png", downloadUrl: "/b.png" },
    ] as RecipeFileInfo[];
    const { enrichmentByRecipeId } = sharedMenuDisplayData({
      recipes: [recipe("a", "Soup"), recipe("b", "Stew"), recipe("c", "Salad")],
      currentVersions: [],
      files,
    });
    expect(enrichmentByRecipeId.get("a")?.firstImageUrl).toBe("/a.jpg");
    expect(enrichmentByRecipeId.get("b")?.firstImageUrl).toBe("/b.png");
    expect(enrichmentByRecipeId.get("c")?.firstImageUrl).toBeNull();
  });
});
