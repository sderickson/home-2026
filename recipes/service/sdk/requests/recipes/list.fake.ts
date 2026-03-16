import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes } from "./mocks.ts";

export const listRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes",
  status: 200,
  handler: async ({ query }) => {
    const list = [...mockRecipes];
    if (
      query.collectionId != null &&
      typeof query.collectionId === "string" &&
      query.collectionId !== ""
    ) {
      const id = query.collectionId;
      return list.filter(
        (r) => (r as { collectionId?: string }).collectionId === id,
      );
    }
    return [];
  },
});
