/**
 * Kratos sends the browser to its settings `ui_url` (account `/settings`) with
 * `?flow=<id>` after a privileged-session re-auth, e.g. when adding a passkey.
 * The flow does not say which account section started it, so each section
 * remembers its flow id here and `/settings` sends the browser back to it.
 *
 * Per-tab session storage: a convenience only. When it is unavailable or has
 * no entry, `/settings` falls back to the MFA section.
 */

const KEY_PREFIX = "hub.account.settings-flow-section.";

export function rememberSettingsFlowSection(flowId: string, path: string): void {
  try {
    sessionStorage.setItem(KEY_PREFIX + flowId, path);
  } catch {
    // Storage blocked (private window, disabled site data): fall back.
  }
}

export function settingsSectionForFlow(flowId: string | undefined): string | undefined {
  if (!flowId) return undefined;
  try {
    const path = sessionStorage.getItem(KEY_PREFIX + flowId);
    // Only same-SPA paths; never follow anything else from storage.
    return path && /^\/[a-z-]+$/.test(path) ? path : undefined;
  } catch {
    return undefined;
  }
}
