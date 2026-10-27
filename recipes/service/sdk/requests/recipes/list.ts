import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

/**
 * List recipes in a collection. GET /recipes?collectionId=... Auth required.
 * Archived recipes are left out unless `archived` is set, which lists only those.
 */
export const listRecipesQuery = (
  collectionId: string,
  options: { archived?: boolean } = {},
) => {
  const archived = options.archived === true;
  return queryOptions({
    queryKey: archived
      ? ["recipes", "list", collectionId, "archived"]
      : ["recipes", "list", collectionId],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes", {
          params: {
            query: { collectionId, ...(archived && { archived: true }) },
          },
        }),
      ),
  });
};
