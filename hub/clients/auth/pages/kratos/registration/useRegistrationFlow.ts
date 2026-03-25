import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { linkToHrefWithHost, navigateToLink } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import {
  fetchBrowserLoginFlow,
  identityNeedsEmailVerification,
  invalidateKratosSessionQueries,
  kratosSessionQueryOptions,
  LoginFlowUpdated,
  registrationFlowQueryKey,
  registrationFlowQueryOptions,
  RegistrationFlowUpdated,
  useUpdateLoginFlowMutation,
  useUpdateRegistrationFlowMutation,
} from "@sderickson/recipes-sdk";
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
      let updated;
      try {
        updated = await updateRegistration.mutateAsync({
          flow: current.id,
          updateRegistrationFlowBody: buildRegistrationPasswordBody(fd),
        });
      } catch (e) {
        submitError.value = registrationSubmitErrorMessage(
          e,
          flowStrings.registration_failed,
        );
        return;
      }

      if (updated instanceof RegistrationFlowUpdated) {
        queryClient.setQueryData(
          registrationFlowQueryKey(toValue(flowId)),
          updated.flow,
        );
        return;
      }

      const destination = postRegistrationNavigationUrl(current);
      const email = traitsEmailFromFormData(fd);
      const password = String(fd.get("password") ?? "");

      let loginResult;
      try {
        const loginFlow = await fetchBrowserLoginFlow(destination);
        loginResult = await updateLogin.mutateAsync({
          flow: loginFlow.id,
          updateLoginFlowBody: buildLoginPasswordBody(
            loginFlow,
            email,
            password,
          ),
        });
      } catch (e) {
        submitError.value = registrationSubmitErrorMessage(
          e,
          flowStrings.post_reg_login_failed,
        );
        return;
      }

      if (loginResult instanceof LoginFlowUpdated) {
        submitError.value = flowStrings.post_reg_login_failed;
        return;
      }

      await invalidateKratosSessionQueries(queryClient);
      const session = await queryClient.fetchQuery(kratosSessionQueryOptions());
      const postVerifyTarget =
        destination ?? linkToHrefWithHost(authLinks.home);

      if (session && identityNeedsEmailVerification(session.identity)) {
        window.location.assign(
          linkToHrefWithHost(authLinks.kratosVerifyWall, {
            params: { redirect: postVerifyTarget },
          }),
        );
      } else if (destination) {
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
