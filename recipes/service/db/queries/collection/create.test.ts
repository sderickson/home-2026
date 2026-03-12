import { describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { eq } from "drizzle-orm";
import { recipesDbManager } from "../../instances.ts";
import { collectionMember } from "../../schemas/collection.ts";
import { createCollection } from "./create.ts";
import { getByIdCollection } from "./get-by-id.ts";

describe("createCollection", () => {
  let dbKey: DbKey;

  beforeEach(async () => {
    dbKey = recipesDbManager.connect();
  });

  afterEach(async () => {
    recipesDbManager.disconnect(dbKey);
  });

  it("creates collection and creator member in a transaction when id is provided", async () => {
    const { result, error } = await createCollection(dbKey, {
      id: "my-collection",
      name: "My Collection",
      creatorEmail: "creator@example.com",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toBe("my-collection");
    expect(result.name).toBe("My Collection");
    expect(result.createdBy).toBe("creator@example.com");
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);

    const got = await getByIdCollection(dbKey, "my-collection");
    assert(got.result);
    expect(got.result.name).toBe("My Collection");

    const db = recipesDbManager.get(dbKey)!;
    const members = await db
      .select()
      .from(collectionMember)
      .where(eq(collectionMember.collectionId, "my-collection"));
    expect(members).toHaveLength(1);
    expect(members[0].email).toBe("creator@example.com");
    expect(members[0].role).toBe("owner");
    expect(members[0].isCreator).toBe(true);
  });

  it("generates URL-safe id when id is omitted", async () => {
    const { result, error } = await createCollection(dbKey, {
      name: "Generated Id Collection",
      creatorEmail: "user@example.com",
    });
    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    assert(result);
    expect(result.id).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(result.id.length).toBeGreaterThan(0);
    expect(result.name).toBe("Generated Id Collection");
    expect(result.createdBy).toBe("user@example.com");
  });
});
