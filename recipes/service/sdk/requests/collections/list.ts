import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const listCollectionsQuery = () => {
  return queryOptions({
    queryKey: ["collections", "list"],
    queryFn: async () =>
      handleClientMethod(getClient().GET("/collections")),
  });
};
