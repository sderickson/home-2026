import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { sql } from "drizzle-orm";
import { recipesDbManager } from "../instances.ts";
import { insertTestCollection, makeRecipeRow } from "../test-fixtures.ts";
import { recipe, recipeVersion } from "../schemas/recipe.ts";
import { recipeFile } from "../schemas/recipe-file.ts";
import { listRecipeFile } from "../queries/recipe-file/list.ts";
import { fixTextTimestamps } from "./fix-text-timestamps.ts";

describe("fixTextTimestamps", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    const db = recipesDbManager.get(dbKey)!;
    await insertTestCollection(db);
  });

  afterEach(() => {
    recipesDbManager.disconnect(dbKey);
  });

  it("converts ISO text timestamps so listRecipeFile can serialize dates", async () => {
    const recipeId = "fix-ts-recipe";
    const fileId = "fix-ts-file";
    const now = new Date();
    const db = recipesDbManager.get(dbKey)!;

    await db.insert(recipe).values(makeRecipeRow({ id: recipeId, createdAt: now }));
    await db.insert(recipeVersion).values({
      id: "fix-ts-version",
      recipeId,
      content: { ingredients: [], instructionsMarkdown: "" },
      isLatest: true,
      createdBy: "tester@example.com",
      createdAt: now,
    });

    // Bypass Drizzle mapping to recreate the legacy ISO-text storage shape.
    db.run(sql`
      INSERT INTO recipe_file (
        id, recipe_id, blob_name, file_original_name, mimetype, size,
        created_at, updated_at
      ) VALUES (
        ${fileId},
        ${recipeId},
        'blob',
        'photo.jpg',
        'image/jpeg',
        12,
        ${"2026-03-12T14:30:47.349Z"},
        ${"2026-03-12T14:30:47.349Z"}
      )
    `);

    const before = await listRecipeFile(dbKey, { recipeId });
    expect(before.error).toBeUndefined();
    expect(Number.isNaN(before.result?.[0]?.created_at.getTime())).toBe(true);

    const { tables } = fixTextTimestamps(dbKey);
    expect(tables.recipe_file).toBe(1);

    const after = await listRecipeFile(dbKey, { recipeId });
    expect(after.error).toBeUndefined();
    expect(after.result?.[0]?.created_at).toBeInstanceOf(Date);
    expect(after.result?.[0]?.created_at.toISOString()).toBe(
      "2026-03-12T14:30:47.000Z",
    );

    // Idempotent — second run is a no-op.
    expect(fixTextTimestamps(dbKey).tables.recipe_file).toBe(0);
  });
});
