import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";
import { generateShortId } from "@saflib/drizzle";
import { collection } from "./collection.ts";

// Recipe version content shape (JSON in recipe_version.content)
export interface RecipeVersionContent {
  ingredients: { name: string; quantity: string; unit: string }[];
  instructionsMarkdown: string;
}

export interface RecipeEntity {
  id: string;
  collectionId: string;
  title: string;
  subtitle: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export const recipe = sqliteTable(
  "recipe",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collection.id),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    description: text("description"),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedBy: text("updated_by").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("recipe_collection_id_idx").on(table.collectionId)],
);

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
      .$defaultFn(() => generateShortId()),
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
