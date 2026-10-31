import { recipesDbManager } from "../../instances.ts";
import type { ReturnsError } from "@saflib/utils";
import { queryWrapper } from "@saflib/drizzle";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipeFile } from "../../schemas/recipe-file.ts";

/** Mark a file as having no stored copy, after its blob was deleted. */
export const clearBlobRecipeFile = queryWrapper(
  async (dbKey: DbKey, id: string): Promise<ReturnsError<void, never>> => {
    const db = recipesDbManager.get(dbKey)!;
    await db
      .update(recipeFile)
      .set({ blob_name: "", size: 0, md5_hash: null, updated_at: new Date() })
      .where(eq(recipeFile.id, id));
    return { result: undefined };
  },
);
