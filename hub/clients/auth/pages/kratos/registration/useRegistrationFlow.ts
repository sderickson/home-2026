import type { RegistrationFlow, UiText } from "@ory/client";
import { ref, type Ref } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import {
  fetchBrowserLoginFlow,
  identityNeedsEmailVerification,
  RegistrationFlowUpdated,
  useUpdateLoginFlowMutation,
  useUpdateRegistrationFlowMutation,
  BrowserRedirectRequired,
  RegistrationCompleted,
  LoginCompleted,
  fetchKratosSession,
} from "@saflib/ory-kratos-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import type { KratosFlowUiMessageFilterContext } from "../common/kratosUiMessages.ts";
import { isKratosPropertyMissingMessage } from "../common/kratosUiMessages.ts";
import {
  buildLoginPasswordBody,
  buildRegistrationPasswordBody,
  registrationSubmitErrorMessage,
  traitsEmailFromFormData,
} from "./Registration.logic.ts";
import { kratos_registration_flow as flowStrings } from "./RegistrationFlowForm.strings.ts";

/**
 * Submit and post-login navigation for an existing registration flow.
 * Flow creation and `?flow=` URL sync live on the page (`Registration.vue` + loader).
 */
export function useRegistrationFlow(flow: Ref<RegistrationFlow>) {
  const updateRegistration = useUpdateRegistrationFlowMutation();
  const updateLogin = useUpdateLoginFlowMutation();

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();

  /**
   * Used to hide Kratos "Property password is missing" on the first response after submitting email
   * only (multi-step password UI). Second submit with an empty password shows the message.
   */
  const registrationSubmitCount = ref(0);

  function registrationMessageFilter(
    msg: UiText,
    _ctx: KratosFlowUiMessageFilterContext,
  ): boolean {
    if (registrationSubmitCount.value !== 1) return true;
    if (!isKratosPropertyMissingMessage(msg)) return true;
    const prop = (msg.context as { property?: string } | undefined)?.property;
    if (prop !== "password") return true;
    return false;
  }

  async function submitRegistrationForm(form: HTMLFormElement) {
    const fd = new FormData(form);
    registrationSubmitCount.value += 1;
    submitting.value = true;
    submitError.value = null;
    /** When true, keep the form in its loading state until the browser navigates away (avoid flashing stale Kratos errors). */
    let keepSubmittingUntilNavigation = false;
    try {
      const updated = await updateRegistration.mutateAsync({
        flow: flow.value.id,
        updateRegistrationFlowBody: buildRegistrationPasswordBody(fd),
      });
      if (updated instanceof BrowserRedirectRequired) {
        if (!updated.payload.redirect_browser_to) {
          throw new Error("Redirect browser to is required");
        }
        window.location.assign(updated.payload.redirect_browser_to);
        keepSubmittingUntilNavigation = true;
        return;
      }
      if (updated instanceof RegistrationFlowUpdated) {
        return;
      }

      if (!(updated instanceof RegistrationCompleted)) {
        throw new Error("Unexpected result");
      }

      const email = traitsEmailFromFormData(fd);
      const password = String(fd.get("password") ?? "");
      const destination = flow.value.return_to ?? postAuthFallbackHref.value;
      const loginFlow = await fetchBrowserLoginFlow(destination);
      const loginResult = await updateLogin.mutateAsync({
        flow: loginFlow.id,
        updateLoginFlowBody: buildLoginPasswordBody(loginFlow, email, password),
      });

      if (!(loginResult instanceof LoginCompleted)) {
        submitError.value = flowStrings.post_reg_login_failed;
        return;
      }

      const session = await fetchKratosSession();

      if (session && identityNeedsEmailVerification(session.identity)) {
        window.location.assign(
          linkToHrefWithHost(authLinks.kratosVerifyWall, {
            params: { return_to: destination },
          }),
        );
      } else {
        window.location.assign(destination);
      }
      keepSubmittingUntilNavigation = true;
    } catch (e) {
      submitError.value = registrationSubmitErrorMessage(
        e,
        flowStrings.registration_failed,
      );
      return;
    } finally {
      if (!keepSubmittingUntilNavigation) {
        submitting.value = false;
      }
    }
  }

  return {
    submitting,
    submitError,
    clearSubmitError,
    submitRegistrationForm,
    registrationMessageFilter,
  };
}
