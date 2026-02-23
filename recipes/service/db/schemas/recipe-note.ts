import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";
import { recipe, recipeVersion } from "./recipe.ts";

export interface RecipeNoteEntity {
  id: string;
  recipeId: string;
  recipeVersionId: string | null;
  body: string;
  everEdited: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export const recipeNote = sqliteTable(
  "recipe_note",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id),
    recipeVersionId: text("recipe_version_id").references(
      () => recipeVersion.id,
    ),
    body: text("body").notNull(),
    everEdited: integer("ever_edited", { mode: "boolean" }).notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedBy: text("updated_by").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("recipe_note_recipe_id_idx").on(table.recipeId)],
);

export type RecipeNoteEntityTest = Expect<
  Equal<RecipeNoteEntity, typeof recipeNote.$inferSelect>
>;
