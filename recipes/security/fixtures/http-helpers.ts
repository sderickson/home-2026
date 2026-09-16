import {
  apiOrigin,
  appOrigin,
  evilOrigin,
  kratosPublicOrigin,
  apexUrl,
  getProtocol,
  getDomain,
  spaOrigin,
} from "@saflib/security/origins/urls";

export {
  apiOrigin,
  appOrigin,
  evilOrigin,
  kratosPublicOrigin,
  apexUrl,
  getProtocol,
  getDomain,
  spaOrigin,
};

export { getCsrfToken } from "@saflib/security/http/csrf";

/** Recipes API host (`api.recipes.{DOMAIN}`). Also aliased as `api.{DOMAIN}` in Caddy. */
export function recipesApiOrigin(): string {
  return apiOrigin("api.recipes");
}
