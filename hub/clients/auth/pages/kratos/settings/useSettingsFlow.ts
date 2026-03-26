import { ref, toValue, type Ref } from "vue";
import { useUpdateSettingsFlowMutation } from "@saflib/ory-kratos-sdk";
import { registrationSubmitErrorMessage } from "../registration/Registration.logic.ts";
import {
  buildSettingsUpdateBodyFromFormData,
  formDataFromKratosSettingsForm,
} from "./Settings.logic.ts";
import { settings_page as pageStrings } from "./Settings.strings.ts";
import { BrowserRedirectRequired } from "@saflib/ory-kratos-sdk";

/**
 * Submit profile / password updates for the active settings flow.
 */
export function useSettingsFlow(flowId: Ref<string>) {
  const updateSettings = useUpdateSettingsFlowMutation();

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  async function submitSettingsForm(
    form: HTMLFormElement,
    submitter?: HTMLElement | null,
  ) {
    const fd = formDataFromKratosSettingsForm(form, submitter);
    submitting.value = true;
    submitError.value = null;
    try {
      const updated = await updateSettings.mutateAsync({
        flow: toValue(flowId),
        updateSettingsFlowBody: buildSettingsUpdateBodyFromFormData(fd),
      });
      if (updated instanceof BrowserRedirectRequired) {
        if (!updated.payload.redirect_browser_to) {
          throw new Error("Redirect browser to is required");
        }
        window.location.assign(updated.payload.redirect_browser_to);
        return;
      }
    } catch (e) {
      submitError.value = registrationSubmitErrorMessage(
        e,
        pageStrings.settings_failed,
      );
      return;
    }
    submitting.value = false;
  }

  return {
    submitting,
    submitError,
    clearSubmitError,
    submitSettingsForm,
  };
}
