#!/usr/bin/env -S node --experimental-strip-types --disable-warning=ExperimentalWarning
import { collectSystemMetrics, setServiceName } from "@saflib/node";
import { addLokiTransport } from "@saflib/vendors-loki";
import { validateEnv } from "@saflib/env";
import envSchema from "./env.schema.combined.json" with { type: "json" };
import { startRecipesService } from "./index.ts";

validateEnv(process.env, envSchema);
setServiceName("recipes");
addLokiTransport();
collectSystemMetrics();

startRecipesService();
