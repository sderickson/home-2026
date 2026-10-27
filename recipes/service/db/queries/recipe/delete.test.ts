import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import {
  insertTestCollection,
  makeRecipeRow,
  TEST_COLLECTION_ID,
} from "../../test-fixtures.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { recipeFile } from "../../schemas/recipe-file.ts";
import { menu } from "../../schemas/menu.ts";
import { deleteRecipe } from "./delete.ts";
import { getByIdRecipe } from "./get-by-id.ts";

describe("deleteRecipe", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db);
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns RecipeNotFoundError when recipe not found", async () => {
    const recipeId = "non-existent-id";
    const out = await deleteRecipe(dbKey, recipeId);
    expect(out.result).toBeUndefined();
    expect(out.error).toBeDefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
    expect(out.error.message).toBe(`Recipe with id '${recipeId}' not found`);
  });

  it("deletes recipe and versions when found", async () => {
    const recipeId = "test-recipe-delete";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      ...makeRecipeRow(),
      id: recipeId,
    });

    await db.insert(recipeVersion).values({
      recipeId,
      content: {
        ingredients: [{ name: "Flour", quantity: "1", unit: "cup" }],
        instructionsMarkdown: "Mix and bake.",
      },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });

    const out = await deleteRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.id).toBe(recipeId);
    expect(out.result.title).toBe("Test Recipe");

    const getOut = await getByIdRecipe(dbKey, recipeId);
    expect(getOut.error).toBeDefined();
    expect(getOut.result).toBeUndefined();
  });

  it("deletes recipe and all dependents (files, versions)", async () => {
    const recipeId = "test-recipe-delete-with-dependents";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      ...makeRecipeRow({ title: "Recipe with files" }),
      id: recipeId,
    });
    await db.insert(recipeVersion).values({
      recipeId,
      content: { ingredients: [], instructionsMarkdown: "" },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });
    await db.insert(recipeFile).values({
      recipe_id: recipeId,
      blob_name: "recipes/a/file.pdf",
      file_original_name: "file.pdf",
      mimetype: "application/pdf",
      size: 100,
    });
    const out = await deleteRecipe(dbKey, recipeId);
    expect(out.error).toBeUndefined();
    assert(out.result);
    expect(out.result.id).toBe(recipeId);

    const getOut = await getByIdRecipe(dbKey, recipeId);
    expect(getOut.error).toBeDefined();
    expect(getOut.result).toBeUndefined();

    const remainingFiles = await db
      .select()
      .from(recipeFile)
      .where(eq(recipeFile.recipe_id, recipeId));
    expect(remainingFiles).toHaveLength(0);
  });

  it("removes the deleted recipe from menus", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const [target, other] = await db
      .insert(recipe)
      .values([makeRecipeRow({ title: "A" }), makeRecipeRow({ title: "B" })])
      .returning();
    const now = new Date();
    const [menuRow] = await db
      .insert(menu)
      .values({
        collectionId: TEST_COLLECTION_ID,
        name: "Weeknights",
        createdBy: "u",
        createdAt: now,
        updatedBy: "u",
        updatedAt: now,
        editedByUserIds: [],
        groupings: [{ name: "Mains", recipeIds: [target!.id, other!.id] }],
      })
      .returning();

    const out = await deleteRecipe(dbKey, target!.id);
    assert(out.result);

    const [after] = await db.select().from(menu).where(eq(menu.id, menuRow!.id));
    expect(after!.groupings).toEqual([
      { name: "Mains", recipeIds: [other!.id] },
    ]);
  });
});
