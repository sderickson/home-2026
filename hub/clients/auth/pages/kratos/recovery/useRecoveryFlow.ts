import {
  type ErrorBrowserLocationChangeRequired,
  type RecoveryFlow,
  RecoveryFlowState,
} from "@ory/client";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import { authLinks } from "@sderickson/hub-links";
import {
  extractBrowserLocationChangeRequiredFromError,
  extractRecoveryFlowFromError,
  invalidateKratosSessionQueries,
  recoveryFlowQueryKey,
  recoveryFlowQueryOptions,
  useUpdateRecoveryFlowMutation,
} from "@sderickson/recipes-sdk";
import { registrationSubmitErrorMessage } from "../registration/Registration.logic.ts";
import {
  buildRecoveryUpdateBodyFromFormData,
  destinationAfterRecovery,
  formDataFromKratosRecoveryForm,
  recoveryFlowContinueWithUrl,
  resolveRecoveryBrowserRedirectUrl,
} from "./Recovery.logic.ts";
import { kratos_recovery_flow as flowStrings } from "./RecoveryFlowForm.strings.ts";

/**
 * Submit recovery flow steps. Flow creation and `?flow=` URL sync live on the page (`Recovery.vue` + loader).
 */
export function useRecoveryFlow(
  flowId: MaybeRefOrGetter<string>,
  browserReturnTo: MaybeRefOrGetter<string>,
  recoveryToken: MaybeRefOrGetter<string | undefined>,
) {
  const queryClient = useQueryClient();
  const updateRecovery = useUpdateRecoveryFlowMutation();

  const returnTo = computed(() => toValue(browserReturnTo));

  const recoveryFlowQuery = useQuery(
    computed(() => recoveryFlowQueryOptions(toValue(flowId), returnTo.value)),
  );

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  function settingsFlowHrefFromId(settingsFlowId: string): string {
    return linkToHrefWithHost(authLinks.kratosSettings, {
      params: { flow: settingsFlowId },
    });
  }

  /**
   * HTTP 422 `ErrorBrowserLocationChangeRequired`: navigate to Kratos-provided URL (no flow cache update).
   */
  async function applyBrowserLocationChangeRequired(
    body: ErrorBrowserLocationChangeRequired,
  ) {
    const raw = body.redirect_browser_to?.trim();
    if (!raw) return;
    const url = resolveRecoveryBrowserRedirectUrl(raw);
    await invalidateKratosSessionQueries(queryClient);
    window.location.assign(url);
  }

  /**
   * Normal 2xx response or validation error body: cache the flow and honor `continue_with` / passed state.
   */
  async function applyRecoveryFlow(updated: RecoveryFlow) {
    queryClient.setQueryData(
      recoveryFlowQueryKey(toValue(flowId), returnTo.value),
      updated,
    );

    const continueUrl = recoveryFlowContinueWithUrl(updated, settingsFlowHrefFromId);
    if (continueUrl) {
      await invalidateKratosSessionQueries(queryClient);
      window.location.assign(continueUrl);
      return;
    }

    if (updated.state === RecoveryFlowState.PassedChallenge) {
      const fallback = destinationAfterRecovery(
        updated.return_to,
        linkToHrefWithHost(appLinks.home),
      );
      await invalidateKratosSessionQueries(queryClient);
      window.location.assign(fallback);
    }
  }

  async function submitRecoveryForm(
    form: HTMLFormElement,
    submitter?: HTMLElement | null,
  ) {
    const current = recoveryFlowQuery.data.value;
    if (!current || submitting.value) return;
    const fd = formDataFromKratosRecoveryForm(form, submitter);
    submitting.value = true;
    submitError.value = null;
    try {
      try {
        const token = toValue(recoveryToken);
        const updated = await updateRecovery.mutateAsync({
          flow: current.id,
          updateRecoveryFlowBody: buildRecoveryUpdateBodyFromFormData(fd),
          ...(token ? { token } : {}),
        });
        await applyRecoveryFlow(updated);
      } catch (e) {
        const locationChange = extractBrowserLocationChangeRequiredFromError(e);
        if (locationChange) {
          await applyBrowserLocationChangeRequired(locationChange);
          return;
        }
        const nextFlow = extractRecoveryFlowFromError(e);
        if (nextFlow) {
          await applyRecoveryFlow(nextFlow);
        } else {
          submitError.value = registrationSubmitErrorMessage(
            e,
            flowStrings.recovery_failed,
          );
        }
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    recoveryFlowQuery,
    flow: computed(() => recoveryFlowQuery.data.value),
    submitting,
    submitError,
    clearSubmitError,
    submitRecoveryForm,
  };
}
