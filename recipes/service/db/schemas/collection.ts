import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { Expect, Equal } from "@saflib/drizzle";
import { generateShortId } from "@saflib/drizzle";

const collectionMemberRoleEnum = ["owner", "editor", "viewer"] as const;
export type CollectionMemberRole = (typeof collectionMemberRoleEnum)[number];

export interface CollectionEntity {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const collection = sqliteTable("collection", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type CollectionEntityTest = Expect<
  Equal<CollectionEntity, typeof collection.$inferSelect>
>;

export interface CollectionMemberEntity {
  id: string;
  collectionId: string;
  email: string;
  role: CollectionMemberRole;
  isCreator: boolean;
  createdAt: Date;
}

export const collectionMember = sqliteTable(
  "collection_member",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateShortId()),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collection.id),
    email: text("email").notNull(),
    role: text("role", { enum: collectionMemberRoleEnum }).notNull(),
    isCreator: integer("is_creator", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("collection_member_collection_id_email_idx").on(
      table.collectionId,
      table.email,
    ),
    index("collection_member_collection_id_idx").on(table.collectionId),
    index("collection_member_email_idx").on(table.email),
  ],
);

export type CollectionMemberEntityTest = Expect<
  Equal<CollectionMemberEntity, typeof collectionMember.$inferSelect>
>;
