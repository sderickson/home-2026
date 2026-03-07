import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const filesListRecipesQuery = (recipeId: string) => {
  return queryOptions({
    queryKey: ["recipes", recipeId, "files"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/files", {
          params: { path: { id: recipeId } },
        }),
      ),
  });
};
