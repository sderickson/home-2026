import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  extractVerificationFlowFromError,
  useKratosSession,
  useUpdateVerificationFlowMutation,
  verificationFlowQueryKey,
  verificationFlowQueryOptions,
} from "@sderickson/recipes-sdk";
import {
  buildVerificationCodeBody,
  buildVerificationResendCodeBody,
  destinationAfterVerification,
  emailForVerificationResend,
} from "./Verification.logic.ts";
import {
  registrationSubmitErrorMessage,
} from "../registration/Registration.logic.ts";
import { kratos_verification_flow as flowStrings } from "./VerificationFlowForm.strings.ts";

/**
 * Submit verification code for an active flow. Flow creation and `?flow=` URL sync live on the page
 * (`Verification.vue` + loader).
 */
export function useVerificationFlow(
  flowId: MaybeRefOrGetter<string>,
  browserReturnTo: MaybeRefOrGetter<string>,
  verificationToken: MaybeRefOrGetter<string | undefined>,
) {
  const queryClient = useQueryClient();
  const updateVerification = useUpdateVerificationFlowMutation();

  const returnTo = computed(() => toValue(browserReturnTo));

  const verificationFlowQuery = useQuery(
    computed(() => verificationFlowQueryOptions(toValue(flowId), returnTo.value)),
  );

  const sessionQuery = useKratosSession();

  const resendEmail = computed(() =>
    emailForVerificationResend(sessionQuery.data.value, verificationFlowQuery.data.value),
  );

  const submitting = ref(false);
  const resending = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  async function resendVerificationCode() {
    const current = verificationFlowQuery.data.value;
    const email = resendEmail.value;
    if (!current || !email || resending.value || submitting.value) return;
    resending.value = true;
    submitError.value = null;
    try {
      try {
        const token = toValue(verificationToken);
        const updated = await updateVerification.mutateAsync({
          flow: current.id,
          updateVerificationFlowBody: buildVerificationResendCodeBody(current, email),
          ...(token ? { token } : {}),
        });
        queryClient.setQueryData(
          verificationFlowQueryKey(toValue(flowId), returnTo.value),
          updated,
        );
      } catch (e) {
        const next = extractVerificationFlowFromError(e);
        if (next) {
          queryClient.setQueryData(
            verificationFlowQueryKey(toValue(flowId), returnTo.value),
            next,
          );
        } else {
          submitError.value = registrationSubmitErrorMessage(
            e,
            flowStrings.verification_failed,
          );
        }
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
      try {
        const token = toValue(verificationToken);
        await updateVerification.mutateAsync({
          flow: current.id,
          updateVerificationFlowBody: buildVerificationCodeBody(fd),
          ...(token ? { token } : {}),
        });
      } catch (e) {
        const next = extractVerificationFlowFromError(e);
        if (next) {
          queryClient.setQueryData(
            verificationFlowQueryKey(toValue(flowId), returnTo.value),
            next,
          );
        } else {
          submitError.value = registrationSubmitErrorMessage(
            e,
            flowStrings.verification_failed,
          );
        }
        return;
      }

      const destination = destinationAfterVerification(
        current.return_to,
        linkToHrefWithHost(appLinks.home),
      );
      window.location.assign(destination);
    } finally {
      submitting.value = false;
    }
  }

  return {
    verificationFlowQuery,
    flow: computed(() => verificationFlowQuery.data.value),
    resendEmail,
    submitting,
    resending,
    submitError,
    clearSubmitError,
    submitVerificationForm,
    resendVerificationCode,
  };
}
