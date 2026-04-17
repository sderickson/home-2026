import { queryOptions } from "@tanstack/vue-query";
import { handleClientMethod } from "@saflib/sdk";
import { getClient } from "../../client.ts";

export const listCollectionsQuery = () => {
  return queryOptions({
    queryKey: ["collections", "list"],
    queryFn: async () => {
      console.log("starting data sleep");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("ending data sleep");
      return handleClientMethod(getClient().GET("/collections"));
    },
  });
};
