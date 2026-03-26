import { ref, type MaybeRefOrGetter, toValue } from "vue";
import {
  useUpdateVerificationFlowMutation,
  VerificationFlowUpdated,
} from "@saflib/ory-kratos-sdk";
import { buildVerificationCodeBody } from "./Verification.logic.ts";
import { registrationSubmitErrorMessage } from "../registration/Registration.logic.ts";
import { kratos_verification_flow as flowStrings } from "./VerificationFlowForm.strings.ts";
import { useVerificationNewBrowserFlow } from "./useVerificationNewBrowserFlow.ts";

/**
 * Submit verification code for an active flow. Starting or replacing a browser flow is handled by
 * {@link useVerificationNewBrowserFlow}.
 */
export function useVerificationFlow(
  verificationToken: MaybeRefOrGetter<string | undefined>,
  flowId: MaybeRefOrGetter<string>,
) {
  const updateVerification = useUpdateVerificationFlowMutation();
  const { startNewBrowserFlow } = useVerificationNewBrowserFlow();

  const submitting = ref(false);
  const resending = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  async function resendVerificationCode() {
    if (resending.value || submitting.value) return;
    resending.value = true;
    submitError.value = null;
    try {
      try {
        await startNewBrowserFlow();
      } catch (e) {
        submitError.value = registrationSubmitErrorMessage(
          e,
          flowStrings.verification_failed,
        );
      }
    } finally {
      resending.value = false;
    }
  }

  async function submitVerificationForm(form: HTMLFormElement) {
    const fd = new FormData(form);
    submitting.value = true;
    submitError.value = null;
    try {
      const token = toValue(verificationToken);
      const updated = await updateVerification.mutateAsync({
        flow: toValue(flowId),
        updateVerificationFlowBody: buildVerificationCodeBody(fd),
        ...(token ? { token } : {}),
      });

      if (!(updated instanceof VerificationFlowUpdated)) {
        throw new Error("Unexpected result");
      }

      window.location.assign(updated.flow.return_to ?? "/login");
    } finally {
      submitting.value = false;
    }
  }

  return {
    submitting,
    resending,
    submitError,
    clearSubmitError,
    submitVerificationForm,
    resendVerificationCode,
  };
}
