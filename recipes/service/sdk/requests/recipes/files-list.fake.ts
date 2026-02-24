import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipeFiles } from "./mocks.ts";

export const filesListRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes/{id}/files",
  status: 200,
  handler: async ({ params }) => {
    const list = mockRecipeFiles
      .filter((f) => f.recipeId === params.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    return list;
  },
});
