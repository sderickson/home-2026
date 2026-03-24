#!/usr/bin/env node
import { startOryKratosService } from "@saflib/ory-kratos";
import { callbacks } from "@sderickson/hub-kratos-courier";
import { addLokiTransport, collectSystemMetrics } from "@saflib/node";
import { setServiceName } from "@saflib/node";
import { validateEnv } from "@saflib/env";
import envSchema from "../env.schema.combined.json" with { type: "json" };

validateEnv(process.env, envSchema);
setServiceName("identity");
addLokiTransport();
collectSystemMetrics();

startOryKratosService({ callbacks });
