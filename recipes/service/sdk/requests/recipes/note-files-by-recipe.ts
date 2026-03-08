import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/**
 * List all note files for a recipe in one request (for detail page loader).
 */
export const recipeNoteFilesGetByNoteIdQuery = (recipeId: string) => {
  return queryOptions({
    queryKey: ["recipes", recipeId, "note-files"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/note-files", {
          params: { path: { id: recipeId } },
        }),
      ),
  });
};
