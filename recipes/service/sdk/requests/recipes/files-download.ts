import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** Fetch authenticated recipe file bytes. GET /recipes/{id}/files/{fileId}/blob. */
export const filesDownloadRecipesQuery = (
  recipeId: string,
  fileId: string,
) => {
  return queryOptions({
    queryKey: ["recipes", recipeId, "files", fileId, "blob"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/files/{fileId}/blob", {
          params: { path: { id: recipeId, fileId } },
          parseAs: "blob",
        }),
      ),
  });
};
