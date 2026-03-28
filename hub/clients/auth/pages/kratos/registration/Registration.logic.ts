import type {
  LoginFlow,
  RegistrationFlow,
  UiNode,
  UpdateLoginFlowBody,
  UpdateRegistrationFlowBody,
} from "@ory/client";
import { getTanstackErrorMessage, TanstackError } from "@saflib/sdk";
import { isAxiosError } from "axios";

export function isKratosInputNode(
  node: UiNode,
): node is UiNode & { attributes: Extract<UiNode["attributes"], { node_type: "input" }> } {
  return (
    node.type === "input" &&
    (node.attributes as { node_type?: string }).node_type === "input"
  );
}

type KratosInputAttrs = { name: string; type: string };

/** Kratos may send password fields as `type="text"`; normalize so the field is masked. */
export function kratosEffectiveInputType(attrs: KratosInputAttrs): string {
  const raw = (attrs.type ?? "text").toLowerCase();
  if (raw === "hidden" || raw === "submit") return raw;
  if (raw === "password") return "password";
  const n = (attrs.name ?? "").toLowerCase();
  if (n === "password" || n.endsWith(".password") || n.endsWith("[password]")) {
    return "password";
  }
  return raw;
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

/**
 * Builds a registration update body from the browser form, including password and passkey methods.
 */
export function buildRegistrationUpdateBodyFromFormData(fd: FormData): UpdateRegistrationFlowBody {
  let method = String(fd.get("method") ?? "").trim();
  if (!method) {
    if (String(fd.get("passkey_register") ?? "").trim()) {
      method = "passkey";
    } else {
      // Email-first step and password registration both use the password method.
      method = "password";
    }
  }
  if (method === "password") {
    return buildRegistrationPasswordBody(fd);
  }
  if (method === "passkey") {
    const traits: Record<string, unknown> = {};
    fd.forEach((value, key) => {
      if (key.startsWith("traits.")) {
        traits[key.slice("traits.".length)] = String(value).trim();
      }
    });
    return {
      method: "passkey",
      csrf_token: String(fd.get("csrf_token") ?? ""),
      passkey_register: String(fd.get("passkey_register") ?? ""),
      traits,
    };
  }
  throw new Error("Missing or unsupported registration method in form");
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
  if (error instanceof TanstackError) {
    return getTanstackErrorMessage(error);
  }
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
