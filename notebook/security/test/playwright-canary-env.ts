import { applyProductionCanaryEnv } from "@saflib/security/playwright/env";

applyProductionCanaryEnv(process.env.DOMAIN ?? "notebook.scotterickson.info");
