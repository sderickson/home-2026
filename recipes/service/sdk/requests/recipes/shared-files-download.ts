import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/** Fetch public shared recipe file bytes. GET /recipes/{id}/shared/files/{fileId}/blob. */
export const sharedFilesDownloadRecipesQuery = (
  recipeId: string,
  fileId: string,
) => {
  return queryOptions({
    queryKey: ["recipes", recipeId, "shared", "files", fileId, "blob"],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}/shared/files/{fileId}/blob", {
          params: { path: { id: recipeId, fileId } },
          parseAs: "blob",
        }),
      ),
  });
};
