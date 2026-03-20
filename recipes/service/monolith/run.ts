import { startRecipesService } from "./index.ts";
import { addLokiTransport, collectSystemMetrics, getGitHashes } from "@saflib/node";
import { setServiceName } from "@saflib/node";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { initSentry } from "@saflib/sentry";
import { startHubIdentityService } from "@sderickson/hub-identity";

validateEnv(process.env, envSchema);
setServiceName("recipes");

const { root, saflib } = getGitHashes();
console.log("[recipes] git hashes: root=%s saflib=%s", root, saflib);

addLokiTransport();
initSentry();
collectSystemMetrics();

startHubIdentityService();
startRecipesService();
