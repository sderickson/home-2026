import type { Session } from "@ory/client";
import type { UpdateVerificationFlowBody } from "@ory/client";

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
