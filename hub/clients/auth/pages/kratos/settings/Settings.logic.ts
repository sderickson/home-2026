import type {
  Session,
  SettingsFlow,
  UiNode,
  UpdateSettingsFlowBody,
} from "@ory/client";

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
    submitter instanceof HTMLButtonElement ||
    submitter instanceof HTMLInputElement
      ? submitter
      : undefined;
  const fd = new FormData(form, btn);
  if (!String(fd.get("method") ?? "").trim()) {
    const methodControl = form.querySelector<
      HTMLInputElement | HTMLButtonElement
    >(
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
  group: "profile" | "password" | "totp",
): UiNode[] {
  const g = group;
  return flow.ui.nodes.filter((node) => {
    if (
      node.attributes &&
      "id" in node.attributes &&
      node.attributes.id === "totp_secret_key"
    )
      return false;
    if (node.group === g) return true;
    if (node.type === "input" && node.group === "default") {
      const attrs = node.attributes as { name?: string };
      return attrs.name === "csrf_token";
    }
    return false;
  });
}

/**
 * Builds an update body from a Kratos settings form. Supports any enabled Kratos settings method.
 */
export function buildSettingsUpdateBodyFromFormData(
  fd: FormData,
): UpdateSettingsFlowBody {
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
  if (!method) {
    throw new Error("Unsupported settings method in form");
  }
  const body: Record<string, string> = {};
  fd.forEach((value, key) => {
    body[key] = String(value);
  });
  return {
    ...body,
    method,
  } as UpdateSettingsFlowBody;
}
