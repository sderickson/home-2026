import { isAxiosError } from "axios";
import type { LoginFlow } from "@ory/client";

/** Kratos may return an updated login flow (validation errors) in the Axios response body (e.g. HTTP 400). */
export function extractLoginFlowFromError(e: unknown): LoginFlow | undefined {
  if (!isAxiosError(e)) return undefined;
  const d = e.response?.data;
  if (d && typeof d === "object" && "ui" in d && "id" in d) {
    return d as LoginFlow;
  }
  return undefined;
}
