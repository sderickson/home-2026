// @ts-nocheck — scaffold placeholders until sdk/add-query or sdk/add-mutation copies this file.
import { baseHandler } from "#test/typed-fake.ts";

// @ts-expect-error TODO: use mock data
import { mockRecipes } from "./mocks.ts";

export const sharedGetRecipesHandler = baseHandler({
  verb: "get",
  path: "/recipes/{id}/shared",
  status: 200,
  // @ts-expect-error TODO: replace with actual response data
  handler: async () => {
    return [];
  },
});
