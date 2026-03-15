import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";
import { generateShortId } from "@saflib/drizzle";
import { collection } from "./collection.ts";

export interface MenuGrouping {
  name: string;
  recipeIds: string[];
}

export interface MenuEntity {
  id: string;
  collectionId: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  editedByUserIds: string[];
  groupings: MenuGrouping[];
}

export const menu = sqliteTable(
  "menu",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collection.id),
    name: text("name").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedBy: text("updated_by").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    editedByUserIds: text("edited_by_user_ids", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    groupings: text("groupings", { mode: "json" })
      .$type<MenuGrouping[]>()
      .notNull(),
  },
  (table) => [index("menu_collection_id_idx").on(table.collectionId)],
);

export type MenuEntityTest = Expect<
  Equal<MenuEntity, typeof menu.$inferSelect>
>;
