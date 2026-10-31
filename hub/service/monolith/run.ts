import { startHubService } from "./index.ts";
import { setServiceName } from "@saflib/node";
import { getGitHashes } from "@saflib/node/git-hashes";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { initSentry } from "@saflib/vendors-sentry-node";
import { startOryKratosService } from "@saflib/ory-kratos-http";
import { callbacks } from "@sderickson/hub-kratos-courier";

validateEnv(process.env, envSchema);
setServiceName("hub");

const { root, saflib } = getGitHashes();
console.log("[hub] git hashes: root=%s saflib=%s", root, saflib);

initSentry();

startOryKratosService({ callbacks });
startHubService();
