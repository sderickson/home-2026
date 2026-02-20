// Hack - load env a better way, but not dotenv, it's endless pushing dotenvx
// Hub model: single domain
process.env.DOMAIN = "docker.localhost";
process.env.PROTOCOL = "http";
process.env.SERVICE_SUBDOMAINS = "identity,hub";

export { default } from "@saflib/playwright/playwright.config";
