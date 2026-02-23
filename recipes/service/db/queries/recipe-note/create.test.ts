import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { RecipeNotFoundError, RecipeVersionNotFoundError } from "../../errors.ts";
import { recipe, recipeVersion } from "../../schemas/recipe.ts";
import { createRecipeNote } from "./create.ts";

describe("createRecipeNote", () => {
  let dbKey: DbKey;

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns error when recipe not found", async () => {
    const out = await createRecipeNote(dbKey, {
      recipeId: "non-existent-id",
      recipeVersionId: null,
      body: "A note",
      everEdited: false,
      createdBy: "user-1",
      updatedBy: "user-1",
    });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
  });

  it("returns error when recipe version not found (nonexistent id)", async () => {
    const recipeId = "test-recipe-create-note-version-check";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      title: "Test Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });

    const out = await createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: "non-existent-version-id",
      body: "A note",
      everEdited: false,
      createdBy: "user-1",
      updatedBy: "user-1",
    });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeVersionNotFoundError);
  });

  it("returns error when recipe version belongs to another recipe", async () => {
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;
    const recipeIdA = "test-recipe-create-note-recipe-a";
    const recipeIdB = "test-recipe-create-note-recipe-b";

    await db.insert(recipe).values([
      {
        id: recipeIdA,
        title: "Recipe A",
        shortDescription: "Short",
        longDescription: null,
        isPublic: true,
        createdBy: "user-1",
        createdAt: now,
        updatedBy: "user-1",
        updatedAt: now,
      },
      {
        id: recipeIdB,
        title: "Recipe B",
        shortDescription: "Short",
        longDescription: null,
        isPublic: true,
        createdBy: "user-1",
        createdAt: now,
        updatedBy: "user-1",
        updatedAt: now,
      },
    ]);
    await db.insert(recipeVersion).values([
      {
        recipeId: recipeIdA,
        content: { ingredients: [], instructionsMarkdown: "" },
        isLatest: true,
        createdBy: "user-1",
        createdAt: now,
      },
      {
        recipeId: recipeIdB,
        content: { ingredients: [], instructionsMarkdown: "" },
        isLatest: true,
        createdBy: "user-1",
        createdAt: now,
      },
    ]);

    const [versionB] = await db
      .select()
      .from(recipeVersion)
      .where(eq(recipeVersion.recipeId, recipeIdB))
      .limit(1);
    assert(versionB);

    const out = await createRecipeNote(dbKey, {
      recipeId: recipeIdA,
      recipeVersionId: versionB.id,
      body: "A note",
      everEdited: false,
      createdBy: "user-1",
      updatedBy: "user-1",
    });
    expect(out.error).toBeDefined();
    expect(out.result).toBeUndefined();
    assert(out.error);
    expect(out.error).toBeInstanceOf(RecipeVersionNotFoundError);
  });

  it("creates a recipe note successfully", async () => {
    const recipeId = "test-recipe-create-note";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      title: "Test Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });

    await db.insert(recipeVersion).values({
      recipeId,
      content: {
        ingredients: [],
        instructionsMarkdown: "",
      },
      isLatest: true,
      createdBy: "user-1",
      createdAt: now,
    });

    const [versionRow] = await db
      .select()
      .from(recipeVersion)
      .where(eq(recipeVersion.recipeId, recipeId))
      .limit(1);
    assert(versionRow);

    const out = await createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: versionRow.id,
      body: "My note body",
      everEdited: false,
      createdBy: "user-1",
      updatedBy: "user-1",
    });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipeId).toBe(recipeId);
    expect(out.result.recipeVersionId).toBe(versionRow.id);
    expect(out.result.body).toBe("My note body");
    expect(out.result.everEdited).toBe(false);
    expect(out.result.createdBy).toBe("user-1");
    expect(out.result.updatedBy).toBe("user-1");
    expect(out.result.id).toBeDefined();
    expect(out.result.createdAt).toBeInstanceOf(Date);
    expect(out.result.updatedAt).toBeInstanceOf(Date);
  });

  it("creates a recipe note with null recipeVersionId", async () => {
    const recipeId = "test-recipe-create-note-null-version";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values({
      id: recipeId,
      title: "Test Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: "user-1",
      createdAt: now,
      updatedBy: "user-1",
      updatedAt: now,
    });

    const out = await createRecipeNote(dbKey, {
      recipeId,
      recipeVersionId: null,
      body: "Note without version",
      everEdited: false,
      createdBy: "user-1",
      updatedBy: "user-1",
    });
    expect(out.error).toBeUndefined();
    expect(out.result).toBeDefined();
    assert(out.result);
    expect(out.result.recipeId).toBe(recipeId);
    expect(out.result.recipeVersionId).toBeNull();
    expect(out.result.body).toBe("Note without version");
  });
});
