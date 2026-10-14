// @ts-nocheck — scaffold placeholders until sdk/add-query or sdk/add-mutation copies this file.
import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "#client.ts";

interface SharedGetRecipesQueryOptions {
  // TODO: Define the interface for the query. Use vue Ref types, e.g.
  // offset: Ref<number>;
  // limit: Ref<number>;
}

export const sharedGetRecipesQuery = (
  // @ts-expect-error TODO: remove or use options
  options: SharedGetRecipesQueryOptions,
) => {
  return queryOptions({
    // TODO: as appropriate, define query key based on the options
    queryKey: ["recipes", "shared-get"],
    queryFn: async () =>
      handleClientMethod(
        // @ts-ignore TODO: update params to match the route
        getClient().GET(
          // @ts-ignore TODO: update params to match the route
          "/recipes/{id}/shared",
          {
            // @ts-ignore TODO: update params to match the route
            params: {
              // limit: options.limit?.value,
            },
          },
        ),
      ),
  });
};
