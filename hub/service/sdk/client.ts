import { createSafClient, TanstackError } from "@saflib/sdk";
import type { paths } from "@sderickson/hub-spec";

let client: ReturnType<typeof createSafClient<paths>> | null = null;

export const getClient = () => {
  if (!client) {
    client = createSafClient<paths>("hub");
  }
  return client;
};

declare module "@tanstack/vue-query" {
  interface Register {
    defaultError: TanstackError;
  }
}
