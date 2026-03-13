import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import { insertTestCollection, makeRecipeRow } from "../../test-fixtures.ts";
import { recipe } from "../../schemas/recipe.ts";
import { hasRecipesCollection } from "./has-recipes.ts";

describe("hasRecipesCollection", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns CollectionNotFoundError when collection does not exist", async () => {
    const { result, error } = await hasRecipesCollection(
      dbKey,
      "non-existent-id",
    );
    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    assert(error);
    expect(error).toBeInstanceOf(CollectionNotFoundError);
    expect(error.message).toBe(
      "Collection with id 'non-existent-id' not found",
    );
  });

  it("returns false when collection exists but has no recipes", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "empty-collection",
      name: "Empty",
      createdBy: "owner@example.com",
    });

    const { result, error } = await hasRecipesCollection(
      dbKey,
      "empty-collection",
    );
    expect(error).toBeUndefined();
    expect(result).toBe(false);
  });

  it("returns true when collection has at least one recipe", async () => {
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db, {
      id: "col-with-recipes",
      name: "With Recipes",
      createdBy: "owner@example.com",
    });
    await db.insert(recipe).values(
      makeRecipeRow({
        collectionId: "col-with-recipes",
        title: "A Recipe",
        createdBy: "owner@example.com",
        updatedBy: "owner@example.com",
      }),
    );

    const { result, error } = await hasRecipesCollection(
      dbKey,
      "col-with-recipes",
    );
    expect(error).toBeUndefined();
    expect(result).toBe(true);
  });
});
