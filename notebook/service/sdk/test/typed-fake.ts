import { typedCreateHandler } from "@saflib/sdk/testing";
import type { paths } from "@sderickson/notebook-spec";

export const { createHandler: baseHandler } =
  typedCreateHandler<paths>();
