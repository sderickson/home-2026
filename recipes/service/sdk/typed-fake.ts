import { typedCreateHandler } from "@saflib/sdk/testing";
import type { paths } from "@sderickson/recipes-spec";

export const { createHandler: recipesHandler } =
  typedCreateHandler<paths>({
    subdomain: "recipes",
  });
