#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning
import { addLokiTransport, collectSystemMetrics } from "@saflib/node";
import { setServiceName } from "@saflib/node";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { startHubIdentityService } from "./index.ts";

validateEnv(process.env, envSchema);
setServiceName("hub-identity");
addLokiTransport();
collectSystemMetrics();

startHubIdentityService();
