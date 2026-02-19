import { createSafClient, TanstackError } from "@saflib/sdk";
import type { paths } from "@sderickson/notebook-spec";

let client: ReturnType<typeof createSafClient<paths>> | null = null;

export const getClient = () => {
  if (!client) {
    client = createSafClient<paths>("notebook");
  }
  return client;
};

declare module "@tanstack/vue-query" {
  interface Register {
    defaultError: TanstackError;
  }
}
