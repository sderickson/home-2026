import { startRecipesService } from "./index.ts";
import { addLokiTransport, collectSystemMetrics } from "@saflib/node";
import { setServiceName } from "@saflib/node";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { initSentry } from "@saflib/sentry";
import { startHubIdentityService } from "@sderickson/hub-identity";

validateEnv(process.env, envSchema);
setServiceName("recipes");

const gitHashRoot = process.env.GIT_HASH_ROOT ?? "unknown";
const gitHashSaflib = process.env.GIT_HASH_SAFLIB ?? "unknown";
console.log("[recipes] git hashes: root=%s saflib=%s", gitHashRoot, gitHashSaflib);

addLokiTransport();
initSentry();
collectSystemMetrics();

startHubIdentityService();
startRecipesService();
