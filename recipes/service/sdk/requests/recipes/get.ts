import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const getRecipeQuery = (id: string) => {
  return queryOptions({
    queryKey: ["recipes", "get", id],
    queryFn: async () =>
      handleClientMethod(
        getClient().GET("/recipes/{id}", {
          params: { path: { id } },
        }),
      ),
  });
};
