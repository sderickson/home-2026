import { Readable } from "stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import { createObjectStore } from "@saflib/object-store";
import {
  collectionQueries,
  recipeFileQueries,
  recipeQueries,
  recipesDb,
} from "@sderickson/recipes-db";
import { cleanupUnsplashCopies } from "./cleanup-unsplash-copies.ts";

const USER_ID = "11111111-1111-1111-1111-111111111111";

describe("cleanupUnsplashCopies", () => {
  let dbKey: DbKey;
  let container: ReturnType<typeof createObjectStore>;
  let recipeId: string;

  async function insertFile(
    blobName: string,
    unsplashImageUrl: string | null,
  ) {
    const { result } = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: blobName,
      file_original_name: "photo.jpg",
      mimetype: "image/jpeg",
      size: 1024,
      uploaded_by: USER_ID,
      unsplash_image_url: unsplashImageUrl,
    });
    if (blobName) {
      const upload = await container.uploadFile(
        blobName,
        Readable.from(Buffer.from("bytes")),
        { mimetype: "image/jpeg", filename: "photo.jpg" },
      );
      if (upload.error) throw upload.error;
    }
    return result!;
  }

  beforeEach(async () => {
    dbKey = recipesDb.connect();
    container = createObjectStore({ type: "test" });
    const { result: collection } = await collectionQueries.createCollection(
      dbKey,
      { name: "Test", creatorEmail: USER_ID },
    );
    const { result } = await recipeQueries.createWithVersionRecipe(dbKey, {
      collectionId: collection!.id,
      title: "Salad",
      subtitle: "",
      description: null,
      createdBy: USER_ID,
      updatedBy: USER_ID,
      versionContent: { ingredients: [], instructionsMarkdown: "" },
    });
    recipeId = result!.recipe.id;
  });

  afterEach(() => {
    recipesDb.disconnect(dbKey);
  });

  it("deletes stored copies of hotlinked photos and leaves uploads alone", async () => {
    const hotlinked = await insertFile(
      `recipes/${recipeId}/old-copy`,
      "https://images.unsplash.com/photo-abc",
    );
    const upload = await insertFile(`recipes/${recipeId}/upload`, null);

    expect(await cleanupUnsplashCopies(dbKey, container)).toEqual({
      deleted: 1,
    });

    expect(
      (await container.readFile(hotlinked.blob_name)).error,
    ).toBeDefined();
    expect((await container.readFile(upload.blob_name)).error).toBeUndefined();
    const { result: files } = await recipeFileQueries.listRecipeFile(dbKey, {
      recipeId,
    });
    expect(files!.find((f) => f.id === hotlinked.id)).toMatchObject({
      blob_name: "",
      size: 0,
      unsplash_image_url: "https://images.unsplash.com/photo-abc",
    });
    expect(files!.find((f) => f.id === upload.id)?.blob_name).toBe(
      upload.blob_name,
    );

    // Second run is a no-op.
    expect(await cleanupUnsplashCopies(dbKey, container)).toEqual({
      deleted: 0,
    });
  });
});
