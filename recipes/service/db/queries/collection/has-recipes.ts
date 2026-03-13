import { recipesDbManager } from "../../instances.ts";
import { CollectionNotFoundError } from "../../errors.ts";
import type { ReturnsError } from "@saflib/monorepo";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { collection } from "../../schemas/collection.ts";
import { recipe } from "../../schemas/recipe.ts";

export type HasRecipesCollectionError = CollectionNotFoundError;

export const hasRecipesCollection = queryWrapper(
  async (
    dbKey: DbKey,
    id: string,
  ): Promise<ReturnsError<boolean, HasRecipesCollectionError>> => {
    const db = recipesDbManager.get(dbKey)!;

    const collectionRows = await db
      .select()
      .from(collection)
      .where(eq(collection.id, id))
      .limit(1);
    if (collectionRows.length === 0) {
      return {
        error: new CollectionNotFoundError(`Collection with id '${id}' not found`),
      };
    }

    const recipeRows = await db
      .select({ id: recipe.id })
      .from(recipe)
      .where(eq(recipe.collectionId, id))
      .limit(1);

    return { result: recipeRows.length > 0 };
  },
);
