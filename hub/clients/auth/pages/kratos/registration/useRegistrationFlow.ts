import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { useRoute } from "vue-router";
import {
  extractLoginFlowFromError,
  extractRegistrationFlowFromError,
  fetchBrowserLoginFlow,
  getKratosFrontendApi,
  registrationFlowQueryKey,
  registrationFlowQueryOptions,
  useInvalidateKratosSession,
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

export interface UseRegistrationFlowOptions {
  /** Override flow id (e.g. unit tests); defaults to `route.query.flow`. */
  flowId?: MaybeRefOrGetter<string | undefined>;
  /** Override `?redirect=` (Kratos `return_to`); defaults to `route.query.redirect`. */
  redirectTo?: MaybeRefOrGetter<string | undefined>;
}

export function useRegistrationFlow(options?: UseRegistrationFlowOptions) {
  const route = useRoute();
  const queryClient = useQueryClient();
  const invalidateSession = useInvalidateKratosSession();
  const updateRegistration = useUpdateRegistrationFlowMutation();

  const flowId = computed(() =>
    options?.flowId !== undefined
      ? toValue(options.flowId)
      : typeof route.query.flow === "string"
        ? route.query.flow
        : undefined,
  );

  const redirectParam = computed(() =>
    options?.redirectTo !== undefined
      ? toValue(options.redirectTo)
      : typeof route.query.redirect === "string"
        ? route.query.redirect
        : undefined,
  );

  const registrationFlowQuery = useQuery(
    computed(() => registrationFlowQueryOptions(flowId.value, redirectParam.value)),
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
      await updateRegistration.mutateAsync({
        flow: current.id,
        updateRegistrationFlowBody: buildRegistrationPasswordBody(fd),
      });

      const destination = postRegistrationNavigationUrl(current);
      const email = traitsEmailFromFormData(fd);
      const password = String(fd.get("password") ?? "");

      try {
        const loginFlow = await fetchBrowserLoginFlow(destination);
        await getKratosFrontendApi().updateLoginFlow({
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

      await invalidateSession();
      if (destination) {
        window.location.assign(destination);
      } else {
        navigateToLink(authLinks.home);
      }
    } catch (e) {
      const next = extractRegistrationFlowFromError(e);
      if (next) {
        queryClient.setQueryData(
          registrationFlowQueryKey(flowId.value, redirectParam.value),
          next,
        );
      } else {
        submitError.value = registrationSubmitErrorMessage(e, flowStrings.registration_failed);
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
