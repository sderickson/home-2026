import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { getByIdRecipe } from "./get-by-id.ts";
import { createWithVersionRecipe } from "./create-with-version.ts";

describe("createWithVersionRecipe", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("should create recipe and first version in a transaction", async () => {
    const params = {
      title: "Test Recipe",
      subtitle: "A short description",
      description: null,
      isPublic: false,
      createdBy: "user-1",
      updatedBy: "user-1",
      versionContent: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and bake.",
      },
    };
    const out = await createWithVersionRecipe(dbKey, params);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe.title).toBe(params.title);
    expect(out.result.recipe.subtitle).toBe(params.subtitle);
    expect(out.result.recipe.description).toBe(params.description);
    expect(out.result.recipe.isPublic).toBe(params.isPublic);
    expect(out.result.recipe.createdBy).toBe(params.createdBy);
    expect(out.result.recipe.updatedBy).toBe(params.updatedBy);
    expect(out.result.recipe.id).toBeDefined();
    expect(out.result.recipe.createdAt).toBeDefined();
    expect(out.result.recipe.updatedAt).toBeDefined();
    expect(out.result.version.recipeId).toBe(out.result.recipe.id);
    expect(out.result.version.isLatest).toBe(true);
    expect(out.result.version.content).toEqual(params.versionContent);
    expect(out.result.version.id).toBeDefined();
    expect(out.result.version.id).not.toBe(out.result.recipe.id);
    expect(out.result.version.createdBy).toBe(params.createdBy);
    expect(out.result.version.createdAt).toBeDefined();
  });

  it("should persist recipe with description and isPublic true", async () => {
    const params = {
      title: "Public Recipe",
      subtitle: "Short",
      description: "A longer description for the recipe.",
      isPublic: true,
      createdBy: "user-2",
      updatedBy: "user-2",
      versionContent: {
        ingredients: [
          { name: "Sugar", quantity: "2", unit: "tbsp" },
          { name: "Salt", quantity: "1/2", unit: "tsp" },
        ],
        instructionsMarkdown: "Combine ingredients. Bake at 350°F for 30 min.",
      },
    };
    const out = await createWithVersionRecipe(dbKey, params);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipe.description).toBe(params.description);
    expect(out.result.recipe.isPublic).toBe(true);
    expect(out.result.version.content.ingredients).toHaveLength(2);
    expect(out.result.version.content.instructionsMarkdown).toBe(
      params.versionContent.instructionsMarkdown,
    );
    const fetched = await getByIdRecipe(dbKey, out.result.recipe.id);
    expect(fetched.error).toBeUndefined();
    assert(fetched.result);
    expect(fetched.result.recipe.title).toBe(params.title);
    expect(fetched.result.latestVersion.content).toEqual(params.versionContent);
  });

  it("should assign distinct ids to each created recipe and version", async () => {
    const params1 = {
      title: "First",
      subtitle: "First short",
      description: null,
      isPublic: false,
      createdBy: "user-1",
      updatedBy: "user-1",
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "Step 1.",
      },
    };
    const params2 = {
      title: "Second",
      subtitle: "Second short",
      description: null,
      isPublic: false,
      createdBy: "user-1",
      updatedBy: "user-1",
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "Step 2.",
      },
    };
    const out1 = await createWithVersionRecipe(dbKey, params1);
    const out2 = await createWithVersionRecipe(dbKey, params2);
    expect(out1.error).toBeUndefined();
    expect(out2.error).toBeUndefined();
    assert(out1.result);
    assert(out2.result);
    expect(out1.result.recipe.id).not.toBe(out2.result.recipe.id);
    expect(out1.result.version.id).not.toBe(out2.result.version.id);
    expect(out1.result.version.recipeId).toBe(out1.result.recipe.id);
    expect(out2.result.version.recipeId).toBe(out2.result.recipe.id);
  });
});
