import { RecoveryFlowState } from "@ory/client";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
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
  recoveryFlowContinueWithUrl,
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

  async function submitRecoveryForm(form: HTMLFormElement) {
    const current = recoveryFlowQuery.data.value;
    if (!current || submitting.value) return;
    const fd = new FormData(form);
    submitting.value = true;
    submitError.value = null;
    try {
      let updated;
      try {
        const token = toValue(recoveryToken);
        updated = await updateRecovery.mutateAsync({
          flow: current.id,
          updateRecoveryFlowBody: buildRecoveryUpdateBodyFromFormData(fd),
          ...(token ? { token } : {}),
        });
      } catch (e) {
        const next = extractRecoveryFlowFromError(e);
        if (next) {
          queryClient.setQueryData(
            recoveryFlowQueryKey(toValue(flowId), returnTo.value),
            next,
          );
        } else {
          submitError.value = registrationSubmitErrorMessage(e, flowStrings.recovery_failed);
        }
        return;
      }

      queryClient.setQueryData(
        recoveryFlowQueryKey(toValue(flowId), returnTo.value),
        updated,
      );

      const continueUrl = recoveryFlowContinueWithUrl(updated);
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
