import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import {
  extractSettingsFlowFromError,
  settingsFlowQueryKey,
  settingsFlowQueryOptions,
  useUpdateSettingsFlowMutation,
} from "@sderickson/recipes-sdk";
import { registrationSubmitErrorMessage } from "../registration/Registration.logic.ts";
import {
  buildSettingsUpdateBodyFromFormData,
  formDataFromKratosSettingsForm,
} from "./Settings.logic.ts";
import { settings_page as pageStrings } from "./Settings.strings.ts";

/**
 * Submit profile / password updates for the active settings flow.
 */
export function useSettingsFlow(
  flowId: MaybeRefOrGetter<string>,
  browserReturnTo: MaybeRefOrGetter<string>,
) {
  const queryClient = useQueryClient();
  const updateSettings = useUpdateSettingsFlowMutation();

  const returnTo = computed(() => toValue(browserReturnTo));

  const settingsFlowQuery = useQuery(
    computed(() => settingsFlowQueryOptions(toValue(flowId), returnTo.value)),
  );

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  async function submitSettingsForm(form: HTMLFormElement, submitter?: HTMLElement | null) {
    const current = settingsFlowQuery.data.value;
    if (!current || submitting.value) return;
    const fd = formDataFromKratosSettingsForm(form, submitter);
    submitting.value = true;
    submitError.value = null;
    try {
      try {
        const updated = await updateSettings.mutateAsync({
          flow: current.id,
          updateSettingsFlowBody: buildSettingsUpdateBodyFromFormData(fd),
        });
        queryClient.setQueryData(
          settingsFlowQueryKey(toValue(flowId), returnTo.value),
          updated,
        );
      } catch (e) {
        const next = extractSettingsFlowFromError(e);
        if (next) {
          queryClient.setQueryData(
            settingsFlowQueryKey(toValue(flowId), returnTo.value),
            next,
          );
        } else {
          submitError.value = registrationSubmitErrorMessage(e, pageStrings.settings_failed);
        }
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    settingsFlowQuery,
    flow: computed(() => settingsFlowQuery.data.value),
    submitting,
    submitError,
    clearSubmitError,
    submitSettingsForm,
  };
}
