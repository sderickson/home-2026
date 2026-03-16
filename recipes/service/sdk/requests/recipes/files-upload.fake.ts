import { generateShortId } from "@saflib/utils";
import type { RecipeFileInfo } from "@sderickson/recipes-spec";
import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeFiles } from "./mocks.ts";

const placeholderUserId = "a1b2c3d4-e89b-12d3-a456-426614174001";

export const filesUploadRecipesHandler = recipesHandler({
  verb: "post",
  path: "/recipes/{id}/files",
  status: 200,
  handler: async ({ params }) => {
    const now = new Date().toISOString();
    const id = generateShortId();
    const recipeId = params.id;
    const fileInfo: RecipeFileInfo = {
      id,
      recipeId,
      blobName: `recipes/${recipeId}/${id}.jpg`,
      fileOriginalName: "uploaded-image.jpg",
      mimetype: "image/jpeg",
      size: 0,
      createdAt: now,
      updatedAt: now,
      uploadedBy: placeholderUserId,
      downloadUrl: `https://picsum.photos/seed/${id}/800/600`,
    };
    mockRecipeFiles.push(fileInfo);
    return fileInfo;
  },
});
