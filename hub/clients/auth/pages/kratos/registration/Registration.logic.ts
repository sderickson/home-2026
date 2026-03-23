import type {
  LoginFlow,
  RegistrationFlow,
  UiNode,
  UpdateLoginFlowBody,
  UpdateRegistrationFlowBody,
} from "@ory/client";
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

export function csrfTokenFromUiFlow(flow: LoginFlow | RegistrationFlow): string {
  for (const node of flow.ui.nodes) {
    if (node.type !== "input") continue;
    const attrs = node.attributes as { node_type?: string; name?: string; value?: string };
    if (attrs.node_type === "input" && attrs.name === "csrf_token") {
      return String(attrs.value ?? "");
    }
  }
  return "";
}

export function buildLoginPasswordBody(
  loginFlow: LoginFlow,
  email: string,
  password: string,
): UpdateLoginFlowBody {
  return {
    method: "password",
    csrf_token: csrfTokenFromUiFlow(loginFlow),
    identifier: email,
    password,
  };
}

/** Kratos echoes `return_to` from the browser registration request on the flow. */
export function postRegistrationNavigationUrl(flow: RegistrationFlow): string | undefined {
  const u = flow.return_to?.trim();
  return u || undefined;
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
