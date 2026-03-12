import { generateShortId } from "@saflib/utils";
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeFiles } from "./mocks.ts";

const placeholderUserId = "a1b2c3d4-e89b-12d3-a456-426614174001";

export const filesFromUnsplashRecipesHandler = recipesHandler({
  verb: "post",
  path: "/recipes/{id}/files/from-unsplash",
  status: 200,
  handler: async ({ params, body }) => {
    const recipeId = params.id;
    const unsplashPhotoId = body?.unsplashPhotoId ?? "unknown";
    const now = new Date().toISOString();
    const id = generateShortId();
    const fileInfo: RecipeFileInfo = {
      id,
      recipeId,
      blobName: `recipes/${recipeId}/${id}`,
      fileOriginalName: `unsplash-${unsplashPhotoId}.jpg`,
      mimetype: "image/jpeg",
      size: 0,
      createdAt: now,
      updatedAt: now,
      uploadedBy: placeholderUserId,
      downloadUrl: `https://storage.example.com/recipes/${recipeId}/${id}`,
      unsplashAttribution: {
        photographerName: "Fake Photographer",
        photographerProfileUrl: `https://unsplash.com/@fake?utm_source=recipes&utm_medium=referral`,
        unsplashSourceUrl: `https://unsplash.com?utm_source=recipes&utm_medium=referral`,
      },
    };
    mockRecipeFiles.push(fileInfo);
    return fileInfo;
  },
});
