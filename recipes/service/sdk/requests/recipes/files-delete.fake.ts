import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeFiles } from "./mocks.ts";

export const filesDeleteRecipesHandler = recipesHandler({
  verb: "delete",
  path: "/recipes/{id}/files/{fileId}",
  status: 204,
  handler: async ({ params }) => {
    const index = mockRecipeFiles.findIndex(
      (f) => f.recipeId === params.id && f.id === params.fileId,
    );
    if (index === -1) return undefined;
    mockRecipeFiles.splice(index, 1);
    return undefined;
  },
});
