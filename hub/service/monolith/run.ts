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

validateEnv(process.env, envSchema);
setServiceName("hub");

const { root, saflib } = getGitHashes();
console.log("[hub] git hashes: root=%s saflib=%s", root, saflib);

initSentry();

configureSecretStore();
const email = await configureEmail(getSecretStore());
startOryKratosService({ callbacks: createCourierCallbacks(email) });
startHubService();
