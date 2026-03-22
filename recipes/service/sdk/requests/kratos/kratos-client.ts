import { Configuration, FrontendApi } from "@ory/client";
import { getProtocol, getHost } from "@saflib/links";

/** Public Kratos URL (browser + CORS). Override with `VITE_KRATOS_PUBLIC_URL` in the host app. */
// export const KRATOS_PUBLIC_BASE_URL: string =
//   import.meta.env.VITE_KRATOS_PUBLIC_URL || "http://kratos.docker.localhost";

let frontendApi: FrontendApi | undefined;

/** Shared Ory Frontend API client (axios + cookies for browser flows). */
export function getKratosFrontendApi(): FrontendApi {
  if (!frontendApi) {
    let protocol = "http";
    let host = "localhost:3000";
    if (typeof document !== "undefined") {
      protocol = getProtocol();
      host = getHost();
    }
    const baseUrl = `${protocol}//kratos.${host}`;
    frontendApi = new FrontendApi(
      new Configuration({
        basePath: baseUrl,
        baseOptions: {
          withCredentials: true,
        },
      }),
    );
  }
  return frontendApi;
}
