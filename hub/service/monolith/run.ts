import { startHubService } from "./index.ts";
import { addLokiTransport, collectSystemMetrics } from "@saflib/node";
import { setServiceName } from "@saflib/node";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { initSentry } from "@saflib/sentry";
import { startHubIdentityService } from "@sderickson/hub-identity";

validateEnv(process.env, envSchema);
setServiceName("hub");
addLokiTransport();
initSentry();
collectSystemMetrics();

startHubIdentityService();
startHubService();
