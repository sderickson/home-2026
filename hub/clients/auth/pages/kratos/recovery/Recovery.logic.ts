import type {
  ContinueWithRedirectBrowserTo,
  ContinueWithSettingsUi,
  RecoveryFlow,
  Session,
  UpdateRecoveryFlowBody,
} from "@ory/client";

/** Whether the recovery flow query should run (new browser flow when logged out, or `?flow=` link). */
export function recoveryFlowShouldFetch(
  sessionIsPending: boolean,
  session: Session | null | undefined,
  flowIdFromRoute: string | undefined,
): boolean {
  if (flowIdFromRoute) return true;
  if (sessionIsPending) return false;
  return session == null;
}

/** Where to send the browser when the flow has no `continue_with` redirect: Kratos `return_to` or recipes home. */
export function destinationAfterRecovery(
  flowReturnTo: string | null | undefined,
  fallbackRecipesHomeHref: string,
): string {
  const u = flowReturnTo?.trim();
  return u || fallbackRecipesHomeHref;
}

/**
 * Builds {@link FormData} for a Kratos recovery submit. Plain `new FormData(form)` **omits** the
 * activated submit control, but Kratos encodes the strategy as `name="method"` on that control
 * (`link` / `code`). Pass the submit event's {@link SubmitEvent.submitter}, or we fall back to
 * the first `[type="submit"][name="method"]` in the form.
 */
export function formDataFromKratosRecoveryForm(
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

/**
 * Builds an update body from the Kratos-rendered recovery form. Supports `link` and `code` strategies.
 */
export function buildRecoveryUpdateBodyFromFormData(fd: FormData): UpdateRecoveryFlowBody {
  const method = String(fd.get("method") ?? "").trim();
  if (method === "link") {
    return {
      method: "link",
      csrf_token: String(fd.get("csrf_token") ?? ""),
      email: String(fd.get("email") ?? "").trim(),
    };
  }
  if (method === "code") {
    const body: Record<string, string> = {
      method: "code",
      csrf_token: String(fd.get("csrf_token") ?? ""),
    };
    const email = fd.get("email");
    if (email != null && String(email).trim()) body.email = String(email).trim();
    const code = fd.get("code");
    if (code != null && String(code).trim()) body.code = String(code).trim();
    const recoveryAddress = fd.get("recovery_address");
    if (recoveryAddress != null && String(recoveryAddress).trim()) {
      body.recovery_address = String(recoveryAddress).trim();
    }
    const recoverySelectAddress = fd.get("recovery_select_address");
    if (recoverySelectAddress != null && String(recoverySelectAddress).trim()) {
      body.recovery_select_address = String(recoverySelectAddress).trim();
    }
    const recoveryConfirmAddress = fd.get("recovery_confirm_address");
    if (recoveryConfirmAddress != null && String(recoveryConfirmAddress).trim()) {
      body.recovery_confirm_address = String(recoveryConfirmAddress).trim();
    }
    const screen = fd.get("screen");
    if (screen != null && String(screen).trim()) body.screen = String(screen).trim();
    return body as unknown as UpdateRecoveryFlowBody;
  }
  throw new Error("Unsupported recovery method in form");
}

/**
 * If Kratos indicates a next step via `continue_with`, return that URL. Does not use `return_to`
 * (that value is present for the whole browser flow, not only when finished).
 */
export function recoveryFlowContinueWithUrl(flow: RecoveryFlow): string | null {
  for (const c of flow.continue_with ?? []) {
    if (c.action === "redirect_browser_to") {
      const u = (c as ContinueWithRedirectBrowserTo).redirect_browser_to?.trim();
      if (u) return u;
    }
    if (c.action === "show_settings_ui") {
      const u = (c as ContinueWithSettingsUi).flow?.url?.trim();
      if (u) return u;
    }
  }
  return null;
}
