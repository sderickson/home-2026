import { startHubService } from "./index.ts";
import { addLokiTransport, collectSystemMetrics } from "@saflib/node";
import { setServiceName } from "@saflib/node";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { initSentry } from "@saflib/sentry";
import { startHubIdentityService } from "@sderickson/hub-identity";
import { startRecipesService } from "@sderickson/recipes-service";
import { startNotebookService } from "@sderickson/notebook-service";

validateEnv(process.env, envSchema);
setServiceName("hub");

const gitHashRoot = process.env.GIT_HASH_ROOT ?? "unknown";
const gitHashSaflib = process.env.GIT_HASH_SAFLIB ?? "unknown";
console.log("[hub] git hashes: root=%s saflib=%s", gitHashRoot, gitHashSaflib);

addLokiTransport();
initSentry();
collectSystemMetrics();

startHubIdentityService();
startHubService();
startRecipesService();
startNotebookService();
