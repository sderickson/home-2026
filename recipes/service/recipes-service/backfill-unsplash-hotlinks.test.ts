import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DbKey } from "@saflib/drizzle";
import {
  collectionQueries,
  recipeFileQueries,
  recipeQueries,
  recipesDb,
} from "@sderickson/recipes-db";
import {
  getPhoto,
  UnsplashNotFoundError,
  UnsplashRateLimitError,
} from "@sderickson/recipes-unsplash";
import { backfillUnsplashHotlinks } from "./backfill-unsplash-hotlinks.ts";

vi.mock("@sderickson/recipes-unsplash", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@sderickson/recipes-unsplash")>()),
  isMocked: () => false,
  getPhoto: vi.fn(),
}));

const USER_ID = "11111111-1111-1111-1111-111111111111";

describe("backfillUnsplashHotlinks", () => {
  let dbKey: DbKey;
  let recipeId: string;

  async function insertStoredUnsplashFile(fileOriginalName: string) {
    const { result } = await recipeFileQueries.insertRecipeFile(dbKey, {
      recipe_id: recipeId,
      blob_name: `recipes/${recipeId}/${fileOriginalName}`,
      file_original_name: fileOriginalName,
      mimetype: "image/jpeg",
      size: 1024,
      uploaded_by: USER_ID,
      unsplash_user: { name: "Photographer" },
    });
    return result!;
  }

  function photoWithRaw(raw: string) {
    return { result: { urls: { raw } } } as Awaited<
      ReturnType<typeof getPhoto>
    >;
  }

  beforeEach(async () => {
    dbKey = recipesDb.connect();
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
    vi.mocked(getPhoto).mockReset();
  });

  it("sets the hotlink from the photo id in the stored filename", async () => {
    const file = await insertStoredUnsplashFile("unsplash-abc_123.jpg");
    vi.mocked(getPhoto).mockResolvedValue(
      photoWithRaw("https://images.unsplash.com/photo-abc?ixid=x"),
    );

    const result = await backfillUnsplashHotlinks(dbKey);

    expect(result).toEqual({ updated: 1, skipped: 0 });
    expect(getPhoto).toHaveBeenCalledWith("abc_123");
    const { result: files } = await recipeFileQueries.listRecipeFile(dbKey, {
      recipeId,
    });
    expect(files![0]).toMatchObject({
      id: file.id,
      unsplash_photo_id: "abc_123",
      unsplash_image_url: "https://images.unsplash.com/photo-abc?ixid=x",
      blob_name: file.blob_name,
    });
    // Second run is a no-op.
    expect(await backfillUnsplashHotlinks(dbKey)).toEqual({
      updated: 0,
      skipped: 0,
    });
  });

  it("skips photos Unsplash no longer has", async () => {
    await insertStoredUnsplashFile("unsplash-gone.jpg");
    vi.mocked(getPhoto).mockResolvedValue({
      error: new UnsplashNotFoundError("gone"),
    } as Awaited<ReturnType<typeof getPhoto>>);

    expect(await backfillUnsplashHotlinks(dbKey)).toEqual({
      updated: 0,
      skipped: 1,
    });
  });

  it("stops on a rate limit so the rest retry next startup", async () => {
    await insertStoredUnsplashFile("unsplash-one.jpg");
    await insertStoredUnsplashFile("unsplash-two.jpg");
    vi.mocked(getPhoto).mockResolvedValue({
      error: new UnsplashRateLimitError("slow down", 429),
    } as Awaited<ReturnType<typeof getPhoto>>);

    const result = await backfillUnsplashHotlinks(dbKey);

    expect(result.updated).toBe(0);
    expect(result.stoppedOn).toBeInstanceOf(UnsplashRateLimitError);
    expect(getPhoto).toHaveBeenCalledTimes(1);
  });
});
