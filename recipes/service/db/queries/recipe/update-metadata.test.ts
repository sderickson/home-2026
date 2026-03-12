import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { insertTestCollection, TEST_COLLECTION_ID } from "../../test-fixtures.ts";
import { createWithVersionRecipe } from "./create-with-version.ts";
import { updateMetadataRecipe } from "./update-metadata.ts";

describe("updateMetadataRecipe", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db);
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("should update recipe metadata and return the updated recipe", async () => {
    const { result: created } = await createWithVersionRecipe(dbKey, {
      collectionId: TEST_COLLECTION_ID,
      title: "Original Title",
      subtitle: "Short",
      description: "Long",
      isPublic: false,
      createdBy: "user-1",
      updatedBy: "user-1",
      versionContent: {
        ingredients: [],
        instructionsMarkdown: "",
      },
    });
    expect(created).toBeDefined();
    assert(created);
    const recipeId = created.recipe.id;

    const { result, error } = await updateMetadataRecipe(dbKey, {
      id: recipeId,
      title: "Updated Title",
      subtitle: "Updated Short",
      description: "Updated Long",
      isPublic: true,
      updatedBy: "user-2",
    });

    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe(recipeId);
    expect(result.title).toBe("Updated Title");
    expect(result.subtitle).toBe("Updated Short");
    expect(result.description).toBe("Updated Long");
    expect(result.isPublic).toBe(true);
    expect(result.updatedBy).toBe("user-2");
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("should return RecipeNotFoundError when recipe id does not exist", async () => {
    const nonexistentId = "00000000-0000-0000-0000-000000000000";
    const { result, error } = await updateMetadataRecipe(dbKey, {
      id: nonexistentId,
      title: "Title",
      subtitle: "Short",
      description: null,
      isPublic: false,
      updatedBy: "user-1",
    });

    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(RecipeNotFoundError);
    expect(error.message).toBe(`Recipe with id '${nonexistentId}' not found`);
  });
});
