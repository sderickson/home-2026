import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";
import { fileMetadataColumns, type FileMetadataFields } from "@saflib/drizzle";
import { recipe } from "./recipe.ts";

export interface RecipeFileEntity extends FileMetadataFields {
  id: string;
  recipe_id: string;
  uploaded_by: string | null;
}

export const recipeFile = sqliteTable(
  "recipe_file",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    recipe_id: text("recipe_id")
      .notNull()
      .references(() => recipe.id),
    ...fileMetadataColumns,
    uploaded_by: text("uploaded_by"),
  },
  (table) => [index("recipe_file_recipe_id_idx").on(table.recipe_id)],
);

export type RecipeFileEntityTest = Expect<
  Equal<RecipeFileEntity, typeof recipeFile.$inferSelect>
>;
