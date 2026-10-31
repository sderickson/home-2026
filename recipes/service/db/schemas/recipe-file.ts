import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";
import {
  fileMetadataColumns,
  generateShortId,
  type FileMetadataFields,
} from "@saflib/drizzle";
import { recipe } from "./recipe.ts";

export interface RecipeFileEntity extends FileMetadataFields {
  id: string;
  recipe_id: string;
  created_at: Date;
  updated_at: Date;
  uploaded_by: string | null;
  unsplash_user: Record<string, unknown> | null;
  unsplash_photo_id: string | null;
  unsplash_image_url: string | null;
}

export const recipeFile = sqliteTable(
  "recipe_file",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    recipe_id: text("recipe_id")
      .notNull()
      .references(() => recipe.id),
    ...fileMetadataColumns,
    created_at: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    uploaded_by: text("uploaded_by"),
    unsplash_user: text("unsplash_user", { mode: "json" }).$type<
      Record<string, unknown>
    >(),
    unsplash_photo_id: text("unsplash_photo_id"),
    /**
     * Unsplash `urls.raw` for the photo. When set, the image is hotlinked from
     * Unsplash (per their API guidelines) rather than served from blob storage,
     * and blob_name may be empty.
     */
    unsplash_image_url: text("unsplash_image_url"),
  },
  (table) => [index("recipe_file_recipe_id_idx").on(table.recipe_id)],
);

export type RecipeFileEntityTest = Expect<
  Equal<RecipeFileEntity, typeof recipeFile.$inferSelect>
>;
