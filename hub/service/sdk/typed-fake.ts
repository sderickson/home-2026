import { typedCreateHandler } from "@saflib/sdk/testing";
import type { paths } from "@sderickson/hub-spec";

export const { createHandler: hubHandler } =
  typedCreateHandler<paths>({
    subdomain: "hub",
  });
