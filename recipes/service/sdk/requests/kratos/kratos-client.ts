import { Configuration, FrontendApi } from "@ory/client";

/** Public Kratos URL (browser + CORS). Override with `VITE_KRATOS_PUBLIC_URL` in the host app. */
export const KRATOS_PUBLIC_BASE_URL: string =
  import.meta.env.VITE_KRATOS_PUBLIC_URL || "http://kratos.docker.localhost";

let frontendApi: FrontendApi | undefined;

/** Shared Ory Frontend API client (axios + cookies for browser flows). */
export function getKratosFrontendApi(): FrontendApi {
  if (!frontendApi) {
    frontendApi = new FrontendApi(
      new Configuration({
        basePath: KRATOS_PUBLIC_BASE_URL,
        baseOptions: {
          withCredentials: true,
        },
      }),
    );
  }
  return frontendApi;
}
