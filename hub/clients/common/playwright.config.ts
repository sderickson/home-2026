// Hack - load env a better way, but not dotenv, it's endless pushing dotenvx
process.env.DOMAIN = "hub.docker.localhost";
process.env.PROTOCOL = "http";
process.env.SERVICE_SUBDOMAINS = "identity,hub";

export { default } from "@saflib/playwright/playwright.config";
