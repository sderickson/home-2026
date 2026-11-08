import { startHubService } from "./index.ts";
import { setServiceName } from "@saflib/node";
import { getGitHashes } from "@saflib/node/git-hashes";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { initSentry } from "@saflib/vendors-sentry-node";
import { startOryKratosService } from "@saflib/ory-kratos-http";
import { createCourierCallbacks } from "@sderickson/hub-kratos-courier";
import {
  configureSecretStore,
  getSecretStore,
} from "@saflib/vendors-infisical";
import { configureEmail } from "@saflib/vendors-brevo";
import { enableHubPersistentLogs } from "@sderickson/hub-ops";

validateEnv(process.env, envSchema);
setServiceName("hub");
// Redacted, searchable logs for GET /ops/logs (see @saflib/node-log-db).
enableHubPersistentLogs();

const { root, saflib } = getGitHashes();
console.log("[hub] git hashes: root=%s saflib=%s", root, saflib);

await initSentry();

configureSecretStore();
const email = await configureEmail(getSecretStore());
startOryKratosService({ callbacks: createCourierCallbacks(email) });
startHubService();
