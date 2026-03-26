import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import {
  useUpdateVerificationFlowMutation,
  verificationFlowQueryKey,
  verificationFlowQueryOptions,
} from "@sderickson/recipes-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import {
  buildVerificationCodeBody,
  destinationAfterVerification,
  verificationFlowIsComplete,
} from "./Verification.logic.ts";
import { registrationSubmitErrorMessage } from "../registration/Registration.logic.ts";
import { kratos_verification_flow as flowStrings } from "./VerificationFlowForm.strings.ts";
import { useVerificationNewBrowserFlow } from "./useVerificationNewBrowserFlow.ts";

/**
 * Submit verification code for an active flow. Starting or replacing a browser flow is handled by
 * {@link useVerificationNewBrowserFlow}.
 */
export function useVerificationFlow(
  flowId: MaybeRefOrGetter<string>,
  browserReturnTo: MaybeRefOrGetter<string>,
  verificationToken: MaybeRefOrGetter<string | undefined>,
) {
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
  const queryClient = useQueryClient();
  const updateVerification = useUpdateVerificationFlowMutation();
  const { startNewBrowserFlow } = useVerificationNewBrowserFlow();

  const returnTo = computed(() => toValue(browserReturnTo));

  const verificationFlowQuery = useQuery(
    computed(() => verificationFlowQueryOptions({ flowId: toValue(flowId), returnTo: returnTo.value })),
  );

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
    const current = verificationFlowQuery.data.value;
    if (!current || submitting.value || resending.value) return;
    const fd = new FormData(form);
    submitting.value = true;
    submitError.value = null;
    try {
      let updated;
      try {
        const token = toValue(verificationToken);
        updated = await updateVerification.mutateAsync({
          flow: current.id,
          updateVerificationFlowBody: buildVerificationCodeBody(fd),
          ...(token ? { token } : {}),
        });
      } catch (e) {
        submitError.value = registrationSubmitErrorMessage(
          e,
          flowStrings.verification_failed,
        );
        return;
      }

      queryClient.setQueryData(
        verificationFlowQueryKey(toValue(flowId), returnTo.value),
        updated,
      );

      if (!verificationFlowIsComplete(updated)) {
        return;
      }

      const destination = destinationAfterVerification(
        updated.return_to ?? current.return_to,
        postAuthFallbackHref.value,
      );
      window.location.assign(destination);
    } finally {
      submitting.value = false;
    }
  }

  return {
    verificationFlowQuery,
    flow: computed(() => verificationFlowQuery.data.value),
    submitting,
    resending,
    submitError,
    clearSubmitError,
    submitVerificationForm,
    resendVerificationCode,
  };
}
