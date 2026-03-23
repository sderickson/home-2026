import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import {
  extractLoginFlowFromError,
  extractRegistrationFlowFromError,
  fetchBrowserLoginFlow,
  registrationFlowQueryKey,
  registrationFlowQueryOptions,
  useUpdateLoginFlowMutation,
  useUpdateRegistrationFlowMutation,
} from "@sderickson/recipes-sdk";
import { navigateToLink } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import {
  buildLoginPasswordBody,
  buildRegistrationPasswordBody,
  postRegistrationNavigationUrl,
  registrationSubmitErrorMessage,
  traitsEmailFromFormData,
} from "./Registration.logic.ts";
import { kratos_registration_flow as flowStrings } from "./RegistrationFlowForm.strings.ts";

/**
 * Submit and post-login navigation for an existing registration flow.
 * Flow creation and `?flow=` URL sync live on the page (`Registration.vue` + loader).
 */
export function useRegistrationFlow(flowId: MaybeRefOrGetter<string>) {
  const queryClient = useQueryClient();
  const updateRegistration = useUpdateRegistrationFlowMutation();
  const updateLogin = useUpdateLoginFlowMutation();

  const registrationFlowQuery = useQuery(
    computed(() => registrationFlowQueryOptions(toValue(flowId))),
  );

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  async function submitRegistrationForm(form: HTMLFormElement) {
    const current = registrationFlowQuery.data.value;
    if (!current || submitting.value) return;
    const fd = new FormData(form);
    submitting.value = true;
    submitError.value = null;
    try {
      try {
        await updateRegistration.mutateAsync({
          flow: current.id,
          updateRegistrationFlowBody: buildRegistrationPasswordBody(fd),
        });
      } catch (e) {
        const next = extractRegistrationFlowFromError(e);
        if (next) {
          queryClient.setQueryData(registrationFlowQueryKey(toValue(flowId)), next);
        } else {
          submitError.value = registrationSubmitErrorMessage(e, flowStrings.registration_failed);
        }
        return;
      }

      const destination = postRegistrationNavigationUrl(current);
      const email = traitsEmailFromFormData(fd);
      const password = String(fd.get("password") ?? "");

      try {
        const loginFlow = await fetchBrowserLoginFlow(destination);
        await updateLogin.mutateAsync({
          flow: loginFlow.id,
          updateLoginFlowBody: buildLoginPasswordBody(loginFlow, email, password),
        });
      } catch (e) {
        const loginNext = extractLoginFlowFromError(e);
        if (loginNext) {
          submitError.value = flowStrings.post_reg_login_failed;
        } else {
          submitError.value = registrationSubmitErrorMessage(
            e,
            flowStrings.post_reg_login_failed,
          );
        }
        return;
      }

      if (destination) {
        window.location.assign(destination);
      } else {
        navigateToLink(authLinks.home);
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    registrationFlowQuery,
    flow: computed(() => registrationFlowQuery.data.value),
    submitting,
    submitError,
    clearSubmitError,
    submitRegistrationForm,
  };
}
