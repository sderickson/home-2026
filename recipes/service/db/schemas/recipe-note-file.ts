import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";
import { fileMetadataColumns, generateShortId, type FileMetadataFields } from "@saflib/drizzle";
import { recipeNote } from "./recipe-note.ts";

export interface RecipeNoteFileEntity extends FileMetadataFields {
  id: string;
  recipe_note_id: string;
  uploaded_by: string | null;
}

export const recipeNoteFile = sqliteTable(
  "recipe_note_file",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    recipe_note_id: text("recipe_note_id")
      .notNull()
      .references(() => recipeNote.id),
    ...fileMetadataColumns,
    uploaded_by: text("uploaded_by"),
  },
  (table) => [index("recipe_note_file_recipe_note_id_idx").on(table.recipe_note_id)],
);

export type RecipeNoteFileEntityTest = Expect<
  Equal<RecipeNoteFileEntity, typeof recipeNoteFile.$inferSelect>
>;
