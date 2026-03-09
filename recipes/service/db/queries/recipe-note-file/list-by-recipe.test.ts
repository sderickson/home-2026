import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { recipesDbManager } from "../../instances.ts";
import { recipe } from "../../schemas/recipe.ts";
import { recipeNote } from "../../schemas/recipe-note.ts";
import { recipeNoteFile } from "../../schemas/recipe-note-file.ts";
import { listRecipeNoteFilesByRecipeId } from "./list-by-recipe.ts";

describe("listRecipeNoteFilesByRecipeId", () => {
  let dbKey: DbKey;
  const seedUserId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(() => {
    recipesDbManager.disconnect(dbKey);
  });

  it("returns empty array when recipe has no notes", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(recipe).values({
      id: "r1",
      title: "Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: seedUserId,
      createdAt: now,
      updatedBy: seedUserId,
      updatedAt: now,
    });
    const { result } = await listRecipeNoteFilesByRecipeId(dbKey, {
      recipeId: "r1",
    });
    expect(result).toEqual([]);
  });

  it("returns all note files for the recipe", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    await db.insert(recipe).values({
      id: "r1",
      title: "Recipe",
      shortDescription: "Short",
      longDescription: null,
      isPublic: true,
      createdBy: seedUserId,
      createdAt: now,
      updatedBy: seedUserId,
      updatedAt: now,
    });
    await db.insert(recipeNote).values([
      {
        id: "n1",
        recipeId: "r1",
        recipeVersionId: null,
        body: "Note 1",
        everEdited: false,
        createdBy: seedUserId,
        createdAt: now,
        updatedBy: seedUserId,
        updatedAt: now,
      },
      {
        id: "n2",
        recipeId: "r1",
        recipeVersionId: null,
        body: "Note 2",
        everEdited: false,
        createdBy: seedUserId,
        createdAt: now,
        updatedBy: seedUserId,
        updatedAt: now,
      },
    ]);
    const nowIso = now.toISOString();
    await db.insert(recipeNoteFile).values([
      {
        id: "f1",
        recipe_note_id: "n1",
        blob_name: "x",
        file_original_name: "a.pdf",
        mimetype: "application/pdf",
        size: 100,
        created_at: nowIso,
        updated_at: nowIso,
        uploaded_by: seedUserId,
      },
      {
        id: "f2",
        recipe_note_id: "n2",
        blob_name: "y",
        file_original_name: "b.jpg",
        mimetype: "image/jpeg",
        size: 200,
        created_at: nowIso,
        updated_at: nowIso,
        uploaded_by: seedUserId,
      },
    ]);

    const { result } = await listRecipeNoteFilesByRecipeId(dbKey, {
      recipeId: "r1",
    });
    expect(result).toHaveLength(2);
    expect(result!.map((f) => f.id).sort()).toEqual(["f1", "f2"]);
  });
});
