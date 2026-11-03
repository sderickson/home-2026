import type { ResponseBody as getMineUserConfigsResponseBody } from "@sderickson/notebook-spec/operations/getMineUserConfigs";
import { createHandler } from "@saflib/express";
import { baseServiceStorage } from "@sderickson/notebook-service-common/context";
import { getSafContextWithAuth } from "@saflib/node";

import { mapUserConfigEntityToApi } from "./_helpers.ts";
import { createIfMissingUserConfig } from "@sderickson/notebook-db/queries/user-config/create-if-missing";

/**
 * GET /user-configs/mine — owner-scoped.
 * Lazy-creates an empty `user_config` row on first access (registration path).
 */
export const getMineUserConfigsHandler = createHandler(async (_req, res) => {
  const ctx = baseServiceStorage.getStore()!;
  const { auth } = getSafContextWithAuth();

  const { result, error } = await createIfMissingUserConfig(ctx.baseDbKey, {
    user_id: auth.userId,
  });

  if (error) {
    throw error satisfies never;
  }

  const response: getMineUserConfigsResponseBody["getMineUserConfigs"][200] = {
    user_config: mapUserConfigEntityToApi(result!),
  };

  res.status(200).json(response);
});
