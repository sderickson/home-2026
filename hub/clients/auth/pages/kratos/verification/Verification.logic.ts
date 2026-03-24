import type { Session, UpdateVerificationFlowBody, VerificationFlow } from "@ory/client";

/** Whether the verification flow query should run (email `?flow=` link, or logged-in browser flow). */
export function verificationFlowShouldFetch(
  sessionIsPending: boolean,
  session: Session | null | undefined,
  flowIdFromRoute: string | undefined,
): boolean {
  if (flowIdFromRoute) return true;
  if (sessionIsPending) return false;
  return session != null;
}

/** Where to send the browser after successful verification: Kratos `return_to` or the recipes app home. */
export function destinationAfterVerification(
  flowReturnTo: string | null | undefined,
  fallbackRecipesHomeHref: string,
): string {
  const u = flowReturnTo?.trim();
  return u || fallbackRecipesHomeHref;
}

export function buildVerificationCodeBody(fd: FormData): UpdateVerificationFlowBody {
  return {
    method: "code",
    csrf_token: String(fd.get("csrf_token") ?? ""),
    code: String(fd.get("code") ?? "").trim(),
  };
}

export function csrfTokenFromVerificationFlow(flow: VerificationFlow): string {
  for (const node of flow.ui.nodes) {
    if (node.type !== "input") continue;
    const attrs = node.attributes as { node_type?: string; name?: string; value?: string };
    if (attrs.node_type === "input" && attrs.name === "csrf_token") {
      return String(attrs.value ?? "");
    }
  }
  return "";
}

/**
 * Email used to request a new verification code (Kratos: `email` on code method invalidates the
 * previous code and re-sends). Prefer session traits; fall back to email-like nodes from the flow.
 */
export function emailForVerificationResend(
  session: Session | null | undefined,
  flow: VerificationFlow | null | undefined,
): string | undefined {
  const traits = session?.identity?.traits as { email?: string } | undefined;
  if (traits?.email?.trim()) return traits.email.trim();
  if (!flow) return undefined;
  for (const node of flow.ui.nodes) {
    if (node.type !== "input") continue;
    const attrs = node.attributes as { name?: string; value?: string };
    const name = attrs.name ?? "";
    if (name === "email" || name === "traits.email" || name.endsWith("email")) {
      const v = attrs.value;
      if (v) return String(v).trim();
    }
  }
  return undefined;
}

/** Resend payload: `method: code` with `email` and no `code` (per Ory Kratos verification API). */
export function buildVerificationResendCodeBody(
  flow: VerificationFlow,
  email: string,
): UpdateVerificationFlowBody {
  return {
    method: "code",
    csrf_token: csrfTokenFromVerificationFlow(flow),
    email: email.trim(),
  };
}
