import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { authLinks } from "@sderickson/hub-links";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import {
  identityNeedsEmailVerification,
  invalidateKratosSessionQueries,
  kratosSessionQueryOptions,
  LoginFlowUpdated,
  loginFlowQueryKey,
  loginFlowQueryOptions,
  useUpdateLoginFlowMutation,
} from "@sderickson/recipes-sdk";
import {
  buildLoginPasswordBody,
  registrationSubmitErrorMessage,
} from "../registration/Registration.logic.ts";
import {
  credentialsFromLoginForm,
  destinationAfterLogin,
} from "./Login.logic.ts";
import { kratos_login_flow as flowStrings } from "./LoginFlowForm.strings.ts";

/**
 * Submit login for an existing login flow. Flow creation and `?flow=` URL sync live on the page
 * (`Login.vue` + loader).
 *
 * @param browserReturnTo — Full URL passed to `createBrowserLoginFlow` / query key (from route in
 *   the page; resolved with {@link resolveLoginBrowserReturnTo} in the loader).
 */
export function useLoginFlow(
  flowId: MaybeRefOrGetter<string>,
  browserReturnTo: MaybeRefOrGetter<string>,
) {
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const queryClient = useQueryClient();
  const updateLogin = useUpdateLoginFlowMutation();

  const returnTo = computed(() => toValue(browserReturnTo));

  const loginFlowQuery = useQuery(
    computed(() => loginFlowQueryOptions({ flowId: toValue(flowId), returnTo: returnTo.value })),
  );

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  async function submitLoginForm(form: HTMLFormElement) {
    const current = loginFlowQuery.data.value;
    if (!current || submitting.value) return;
    const fd = new FormData(form);
    const { identifier, password } = credentialsFromLoginForm(fd);
    submitting.value = true;
    submitError.value = null;
    try {
      let result;
      try {
        result = await updateLogin.mutateAsync({
          flow: current.id,
          updateLoginFlowBody: buildLoginPasswordBody(current, identifier, password),
        });
      } catch (e) {
        submitError.value = registrationSubmitErrorMessage(e, flowStrings.login_failed);
        return;
      }

      if (result instanceof LoginFlowUpdated) {
        queryClient.setQueryData(loginFlowQueryKey(toValue(flowId), returnTo.value), result.flow);
        return;
      }

      await invalidateKratosSessionQueries(queryClient);
      const session = await queryClient.fetchQuery(kratosSessionQueryOptions());
      const destination = destinationAfterLogin(current.return_to, postAuthFallbackHref.value);
      if (session && identityNeedsEmailVerification(session.identity)) {
        window.location.assign(
          linkToHrefWithHost(authLinks.kratosVerifyWall, { params: { redirect: destination } }),
        );
      } else {
        window.location.assign(destination);
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    loginFlowQuery,
    flow: computed(() => loginFlowQuery.data.value),
    submitting,
    submitError,
    clearSubmitError,
    submitLoginForm,
  };
}
