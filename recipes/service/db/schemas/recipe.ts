import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";

// Recipe version content shape (JSON in recipe_version.content)
export interface RecipeVersionContent {
  ingredients: { name: string; quantity: string; unit: string }[];
  instructionsMarkdown: string;
}

export interface RecipeEntity {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string | null;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export const recipe = sqliteTable("recipe", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull(),
  longDescription: text("long_description"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type RecipeEntityTest = Expect<
  Equal<RecipeEntity, typeof recipe.$inferSelect>
>;

export interface RecipeVersionEntity {
  id: string;
  recipeId: string;
  content: RecipeVersionContent;
  isLatest: boolean;
  createdBy: string;
  createdAt: Date;
}

export const recipeVersion = sqliteTable(
  "recipe_version",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id),
    content: text("content", { mode: "json" })
      .$type<RecipeVersionContent>()
      .notNull(),
    isLatest: integer("is_latest", { mode: "boolean" }).notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("recipe_version_recipe_id_is_latest_idx").on(table.recipeId, table.isLatest)],
);

export type RecipeVersionEntityTest = Expect<
  Equal<RecipeVersionEntity, typeof recipeVersion.$inferSelect>
>;
