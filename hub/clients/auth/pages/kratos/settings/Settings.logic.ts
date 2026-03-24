import type { Session, SettingsFlow, UiNode, UpdateSettingsFlowBody } from "@ory/client";
import { UiNodeGroupEnum } from "@ory/client";

/** Settings flow query runs only when the user has a Kratos session (browser flow creation requires auth). */
export function settingsFlowShouldFetch(
  sessionIsPending: boolean,
  session: Session | null | undefined,
): boolean {
  if (sessionIsPending) return false;
  return session != null;
}

/**
 * Builds {@link FormData} for a Kratos settings submit (same submit-button omission issue as recovery).
 */
export function formDataFromKratosSettingsForm(
  form: HTMLFormElement,
  submitter: HTMLElement | null | undefined,
): FormData {
  const btn =
    submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement
      ? submitter
      : undefined;
  const fd = new FormData(form, btn);
  if (!String(fd.get("method") ?? "").trim()) {
    const methodControl = form.querySelector<HTMLInputElement | HTMLButtonElement>(
      'button[type="submit"][name="method"], input[type="submit"][name="method"]',
    );
    if (methodControl?.name) {
      fd.set(methodControl.name, methodControl.value ?? "");
    }
  }
  return fd;
}

/** Nodes for one settings group (e.g. profile / password), plus shared CSRF from `default`. */
export function settingsNodesForGroup(
  flow: SettingsFlow,
  group: "profile" | "password",
): UiNode[] {
  const g = group === "profile" ? UiNodeGroupEnum.Profile : UiNodeGroupEnum.Password;
  return flow.ui.nodes.filter((node) => {
    if (node.type === "text") {
      return node.group === g;
    }
    if (node.type !== "input") return false;
    if (node.group === UiNodeGroupEnum.Default) {
      const attrs = node.attributes as { name?: string };
      return attrs.name === "csrf_token";
    }
    return node.group === g;
  });
}

/**
 * Builds an update body from a Kratos settings form. Supports `profile` and `password` methods.
 */
export function buildSettingsUpdateBodyFromFormData(fd: FormData): UpdateSettingsFlowBody {
  const method = String(fd.get("method") ?? "").trim();
  if (method === "profile") {
    const traits: Record<string, unknown> = {};
    fd.forEach((value, key) => {
      if (key.startsWith("traits.")) {
        traits[key.slice("traits.".length)] = String(value).trim();
      }
    });
    return {
      method: "profile",
      csrf_token: String(fd.get("csrf_token") ?? ""),
      traits,
    } as UpdateSettingsFlowBody;
  }
  if (method === "password") {
    return {
      method: "password",
      csrf_token: String(fd.get("csrf_token") ?? ""),
      password: String(fd.get("password") ?? ""),
    } as UpdateSettingsFlowBody;
  }
  throw new Error("Unsupported settings method in form");
}
