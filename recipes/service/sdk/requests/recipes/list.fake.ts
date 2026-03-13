import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes } from "./mocks.ts";

export const listRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes",
  status: 200,
  handler: async ({ query }) => {
    let list = [...mockRecipes];
    if (query.publicOnly === "true") {
      list = list.filter((r) => r.isPublic);
    } else if (
      query.collectionId != null &&
      typeof query.collectionId === "string" &&
      query.collectionId !== ""
    ) {
      const id = query.collectionId;
      list = list.filter(
        (r) => (r as { collectionId?: string }).collectionId === id,
      );
    }
    return list;
  },
});
