import { typedEnv } from "./env.ts";

/**
 * Base URL for the recipes API (e.g. https://api.recipes.example.com).
 * Used for absolute URLs in responses (e.g. file downloadUrl) when the SPA and API are on different subdomains.
 */
export function getRecipesApiBaseUrl(): string {
  return `${typedEnv.PROTOCOL}://api.recipes.${typedEnv.DOMAIN}`;
}
