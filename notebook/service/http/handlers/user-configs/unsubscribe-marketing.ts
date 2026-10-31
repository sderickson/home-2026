import type {
  ResponseBody,
  RequestBody,
} from "@sderickson/notebook-spec/operations/unsubscribeMarketingEmailsUserConfigs";
import { createHandler } from "@saflib/express";
import { baseServiceStorage } from "@sderickson/notebook-service-common/context";
import { getSafReporters } from "@saflib/node";

import { resolveUserIdByEmail } from "./_helpers.ts";
import { clearMarketingEmailsOptIn } from "@sderickson/notebook-db/queries/user-config/clear-marketing-opt-in";

/**
 * Public marketing unsubscribe. Always 200 — never reveals whether the email
 * matched an identity or whether preferences changed.
 */
export const unsubscribeMarketingEmailsUserConfigsHandler = createHandler(
  async (req, res) => {
    const data: RequestBody["unsubscribeMarketingEmailsUserConfigs"] = req.body;
    const { log } = getSafReporters();

    try {
      const email = data.email.trim().toLowerCase();
      if (email) {
        try {
          const userId = await resolveUserIdByEmail(email);
          if (userId) {
            const ctx = baseServiceStorage.getStore()!;
            await clearMarketingEmailsOptIn(ctx.baseDbKey, { user_id: userId });
          }
        } catch (e) {
          log.error("marketing unsubscribe DB/identity failed", { err: e });
        }
      }
    } catch (e) {
      log.error("marketing unsubscribe failed (returning 200 anyway)", {
        err: e,
      });
    }

    const response: ResponseBody["unsubscribeMarketingEmailsUserConfigs"][200] =
      {};
    res.status(200).json(response);
  },
);
