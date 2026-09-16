#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning
import { collectSystemMetrics, setServiceName } from "@saflib/node";
import { addLokiTransport } from "@saflib/vendors-loki";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { startHubService } from "./index.ts";

validateEnv(process.env, envSchema);
setServiceName("hub");
addLokiTransport();
collectSystemMetrics();

startHubService();
