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
import {
  buildLoginPasswordBody,
  buildRegistrationPasswordBody,
  registrationSubmitErrorMessage,
  traitsEmailFromFormData,
} from "./Registration.logic.ts";
import { kratos_registration_flow as flowStrings } from "./RegistrationFlowForm.strings.ts";
import type { RegistrationFlow } from "@ory/client";

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

  async function submitRegistrationForm(form: HTMLFormElement) {
    const fd = new FormData(form);
    submitting.value = true;
    submitError.value = null;
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
    } catch (e) {
      submitError.value = registrationSubmitErrorMessage(
        e,
        flowStrings.registration_failed,
      );
      return;
    } finally {
      submitting.value = false;
    }
  }

  return {
    submitting,
    submitError,
    clearSubmitError,
    submitRegistrationForm,
  };
}
