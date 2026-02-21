import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const listRecipesQuery = () => {
  return queryOptions({
    queryKey: ["recipes", "list"],
    queryFn: async () =>
      handleClientMethod(getClient().GET("/recipes")),
  });
};
