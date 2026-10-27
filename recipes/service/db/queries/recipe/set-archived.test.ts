import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import {
  insertTestCollection,
  makeRecipeRow,
  TEST_COLLECTION_ID,
} from "../../test-fixtures.ts";
import { recipe } from "../../schemas/recipe.ts";
import { menu } from "../../schemas/menu.ts";
import { RecipeNotFoundError } from "../../errors.ts";
import { setArchivedRecipe } from "./set-archived.ts";

describe("setArchivedRecipe", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
    await insertTestCollection(recipesDbManager.get(dbKey)!);
  });

  afterEach(() => {
    recipesDbManager.disconnect(dbKey);
  });

  async function insertMenu(name: string, recipeIds: string[]) {
    const db = recipesDbManager.get(dbKey)!;
    const now = new Date();
    const [row] = await db
      .insert(menu)
      .values({
        collectionId: TEST_COLLECTION_ID,
        name,
        createdBy: "u",
        createdAt: now,
        updatedBy: "u",
        updatedAt: now,
        editedByUserIds: [],
        groupings: [{ name: "Mains", recipeIds }],
      })
      .returning();
    return row!;
  }

  it("archives a recipe and removes it from menus", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const [target, other] = await db
      .insert(recipe)
      .values([makeRecipeRow({ title: "A" }), makeRecipeRow({ title: "B" })])
      .returning();
    const withIt = await insertMenu("With", [target!.id, other!.id]);
    const without = await insertMenu("Without", [other!.id]);

    const out = await setArchivedRecipe(dbKey, {
      id: target!.id,
      archived: true,
      updatedBy: "archiver",
    });
    assert(out.result);
    expect(out.result.recipe.archivedAt).toBeInstanceOf(Date);
    expect(out.result.recipe.updatedBy).toBe("archiver");
    expect(out.result.removedFromMenus.map((m) => m.id)).toEqual([withIt.id]);

    const [menuRow] = await db.select().from(menu).where(eq(menu.id, withIt.id));
    expect(menuRow!.groupings).toEqual([
      { name: "Mains", recipeIds: [other!.id] },
    ]);
    const [untouched] = await db
      .select()
      .from(menu)
      .where(eq(menu.id, without.id));
    expect(untouched!.updatedAt).toEqual(without.updatedAt);
  });

  it("unarchives without touching menus", async () => {
    const db = recipesDbManager.get(dbKey)!;
    const [row] = await db
      .insert(recipe)
      .values(makeRecipeRow({ archivedAt: new Date() }))
      .returning();

    const out = await setArchivedRecipe(dbKey, {
      id: row!.id,
      archived: false,
      updatedBy: "u",
    });
    assert(out.result);
    expect(out.result.recipe.archivedAt).toBeNull();
    expect(out.result.removedFromMenus).toEqual([]);
  });

  it("returns RecipeNotFoundError for an unknown id", async () => {
    const out = await setArchivedRecipe(dbKey, {
      id: "missing",
      archived: true,
      updatedBy: "u",
    });
    expect(out.error).toBeInstanceOf(RecipeNotFoundError);
  });
});
