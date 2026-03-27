import { ref, type MaybeRefOrGetter, toValue } from "vue";
import {
  useUpdateVerificationFlowMutation,
  VerificationFlowUpdated,
} from "@saflib/ory-kratos-sdk";
import { buildVerificationCodeBody } from "./Verification.logic.ts";

/**
 * Submit verification code for an active flow. Starting a browser flow is handled by
 * {@link useNewVerificationEntryHref} / the `/new-verification` route.
 */
export function useVerificationFlow(
  verificationToken: MaybeRefOrGetter<string | undefined>,
  flowId: MaybeRefOrGetter<string>,
) {
  const updateVerification = useUpdateVerificationFlowMutation();

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
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
    submitError,
    clearSubmitError,
    submitVerificationForm,
  };
}
