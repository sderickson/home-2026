import { startRecipesService } from "./index.ts";
import { collectSystemMetrics, getGitHashes, setServiceName } from "@saflib/node";
import { addLokiTransport } from "@saflib/vendors-loki";
import { validateEnv } from "@saflib/env";
import { configureMockErrors } from "@saflib/errors-service";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { initSentry } from "@saflib/vendors-sentry-node";
import { startOryKratosService } from "@saflib/ory-kratos-http";
import { callbacks } from "@sderickson/hub-kratos-courier";
import { initializeDependencies } from "@sderickson/recipes-service-common";

validateEnv(process.env, envSchema);
setServiceName("recipes");

const { root, saflib } = getGitHashes();
console.log("[recipes] git hashes: root=%s saflib=%s", root, saflib);

addLokiTransport();
configureMockErrors();
initSentry();
collectSystemMetrics();

await initializeDependencies();
startOryKratosService({ callbacks });
startRecipesService();
