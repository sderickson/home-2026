import type { paths } from "@sderickson/notebook-spec";
import { createApiClient } from "@sderickson/notebook-sdk-common/client";

/** The notebook API client, typed by the notebook spec. */
export const getClient = createApiClient<paths>();
