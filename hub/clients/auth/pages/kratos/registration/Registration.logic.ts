import type { UiNode, UpdateRegistrationFlowBody } from "@ory/client";
import { isAxiosError } from "axios";

export function isKratosInputNode(
  node: UiNode,
): node is UiNode & { attributes: Extract<UiNode["attributes"], { node_type: "input" }> } {
  return (
    node.type === "input" &&
    (node.attributes as { node_type?: string }).node_type === "input"
  );
}

/** Resolve email from Kratos password-method registration FormData. */
export function traitsEmailFromFormData(fd: FormData): string {
  return (
    String(fd.get("traits.email") ?? "").trim() ||
    String(fd.get("email") ?? "").trim() ||
    String(fd.get("traits[email]") ?? "").trim()
  );
}

export function buildRegistrationPasswordBody(fd: FormData): UpdateRegistrationFlowBody {
  return {
    method: "password",
    csrf_token: String(fd.get("csrf_token") ?? ""),
    password: String(fd.get("password") ?? ""),
    traits: { email: traitsEmailFromFormData(fd) },
  };
}

export function registrationSubmitErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const d = error.response?.data;
    if (d !== undefined && typeof d !== "object") {
      return String(d);
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
