import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const notesFilesListRecipesQuery = (recipeId: string, noteId: string) => {
  return queryOptions({
    queryKey: ["recipes", recipeId, "notes", noteId, "files"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/notes/{noteId}/files", {
          params: { path: { id: recipeId, noteId } },
        }),
      ),
  });
};
