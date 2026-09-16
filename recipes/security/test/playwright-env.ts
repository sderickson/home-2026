import { applyLocalDevSecurityEnv } from "@saflib/security/playwright/env";

/** Recipes/dev + deploy prod-local share DOMAIN=docker.localhost. */
applyLocalDevSecurityEnv("docker.localhost");
