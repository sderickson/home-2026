import { recipesHandler } from "../../typed-fake.ts";
import { mockRecipes } from "./mocks.ts";

export const listRecipesHandler = recipesHandler({
  verb: "get",
  path: "/recipes",
  status: 200,
  handler: async ({ query }) => {
    let list = [...mockRecipes];
    if (query.title != null && query.title !== "") {
      list = list.filter((r) =>
        r.title.toLowerCase().includes(query.title!.toLowerCase()),
      );
    }
    return list;
  },
});
