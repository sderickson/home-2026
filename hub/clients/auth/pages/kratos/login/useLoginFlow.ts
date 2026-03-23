import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  extractLoginFlowFromError,
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
  const queryClient = useQueryClient();
  const updateLogin = useUpdateLoginFlowMutation();

  const returnTo = computed(() => toValue(browserReturnTo));

  const loginFlowQuery = useQuery(
    computed(() => loginFlowQueryOptions(toValue(flowId), returnTo.value)),
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
      try {
        await updateLogin.mutateAsync({
          flow: current.id,
          updateLoginFlowBody: buildLoginPasswordBody(current, identifier, password),
        });
      } catch (e) {
        const next = extractLoginFlowFromError(e);
        if (next) {
          queryClient.setQueryData(loginFlowQueryKey(toValue(flowId), returnTo.value), next);
        } else {
          submitError.value = registrationSubmitErrorMessage(e, flowStrings.login_failed);
        }
        return;
      }

      const destination = destinationAfterLogin(current.return_to, linkToHrefWithHost(appLinks.home));
      window.location.assign(destination);
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
