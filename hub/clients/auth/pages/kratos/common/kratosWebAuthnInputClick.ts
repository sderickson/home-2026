import type { UiNode } from "@ory/client";
import { isKratosInputNode } from "../registration/Registration.logic.ts";
import {
  invokeOryWebAuthnByTrigger,
  wireOryWebAuthnWindowAliases,
} from "./oryWebAuthnWindow.ts";

/**
 * Runs Kratos-injected WebAuthn / passkey handlers on input nodes (`onclick` or `onclickTrigger`).
 * Mirrors Ory's reference UI: {@link https://www.ory.sh/docs/kratos/bring-your-own-ui/custom-ui-advanced-integration}
 */
export function runKratosWebAuthnInputClick(node: UiNode): void {
  if (!isKratosInputNode(node)) return;
  const attrs = node.attributes;
  const js = attrs.onclick?.trim();
  if (js) {
    wireOryWebAuthnWindowAliases();
    // Ory embeds snippets that call `window.oryPasskey…` — aliases must exist before eval.
    // eslint-disable-next-line no-eval -- required for Kratos WebAuthn / passkey flows
    (0, eval)(js);
    return;
  }
  const trigger = attrs.onclickTrigger;
  if (!trigger || trigger === "11184809") return;
  invokeOryWebAuthnByTrigger(trigger);
}
