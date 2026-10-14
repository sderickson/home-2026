import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** Load a recipe for the public share page. GET /recipes/{id}/shared. No auth. */
export const sharedGetRecipesQuery = (id: string) => {
  return queryOptions({
    queryKey: ["recipes", id, "shared"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/shared", {
          params: { path: { id } },
        }),
      ),
  });
};
