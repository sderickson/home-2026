import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeVersionNotFoundError } from "../../errors.ts";
import {
  insertTestCollection,
  makeRecipeRow,
  TEST_COLLECTION_ID,
} from "../../test-fixtures.ts";
import { recipe } from "../../schemas/recipe.ts";
import { createWithVersionRecipe } from "./create-with-version.ts";
import { updateLatestVersionRecipe } from "./update-latest-version.ts";

describe("updateLatestVersionRecipe", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db);
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("should update latest version content in place and return the updated version", async () => {
    const { result: created } = await createWithVersionRecipe(dbKey, {
      collectionId: TEST_COLLECTION_ID,
      title: "Recipe",
      subtitle: "Short",
      description: null,
      createdBy: "user-1",
      updatedBy: "user-1",
      versionContent: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "# Step 1\nMix.",
      },
    });
    expect(created).toBeDefined();
    assert(created);
    const recipeId = created.recipe.id;
    const versionId = created.version.id;

    const newContent = {
      ingredients: [{ name: "Sugar", quantity: "2", unit: "tbsp" }],
      instructionsMarkdown: "# Step 1\nMix.\n\n# Step 2\nBake.",
    };

    const { result, error } = await updateLatestVersionRecipe(dbKey, {
      recipeId,
      content: newContent,
    });

    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe(versionId);
    expect(result.recipeId).toBe(recipeId);
    expect(result.isLatest).toBe(true);
    expect(result.content).toEqual(newContent);
  });

  it("should return RecipeVersionNotFoundError when recipe does not exist", async () => {
    const nonexistentRecipeId = "00000000-0000-0000-0000-000000000000";
    const { result, error } = await updateLatestVersionRecipe(dbKey, {
      recipeId: nonexistentRecipeId,
      content: {
        ingredients: [],
        instructionsMarkdown: "",
      },
    });

    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(RecipeVersionNotFoundError);
    expect(error.message).toBe(
      `Latest version not found for recipe '${nonexistentRecipeId}'`,
    );
  });

  it("should return RecipeVersionNotFoundError when recipe exists but has no version", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const [inserted] = await db
      .insert(recipe)
      .values(makeRecipeRow({ title: "Orphan Recipe", isPublic: false }))
      .returning();
    expect(inserted).toBeDefined();
    assert(inserted);
    const recipeId = inserted.id;

    const { result, error } = await updateLatestVersionRecipe(dbKey, {
      recipeId,
      content: {
        ingredients: [],
        instructionsMarkdown: "",
      },
    });

    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(RecipeVersionNotFoundError);
    expect(error.message).toBe(
      `Latest version not found for recipe '${recipeId}'`,
    );
  });
});
