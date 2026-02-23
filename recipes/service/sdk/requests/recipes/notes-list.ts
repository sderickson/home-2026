import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const notesListRecipesQuery = (recipeId: string) => {
  return queryOptions({
    queryKey: ["recipes", recipeId, "notes"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/notes", {
          params: { path: { id: recipeId } },
        }),
      ),
  });
};
