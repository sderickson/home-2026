import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, type MaybeRefOrGetter, toValue } from "vue";
import { linkToHrefWithHost } from "@saflib/links";
import { appLinks } from "@sderickson/recipes-links";
import {
  extractVerificationFlowFromError,
  useUpdateVerificationFlowMutation,
  verificationFlowQueryKey,
  verificationFlowQueryOptions,
} from "@sderickson/recipes-sdk";
import {
  buildVerificationCodeBody,
  destinationAfterVerification,
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

  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  function clearSubmitError() {
    submitError.value = null;
  }

  async function submitVerificationForm(form: HTMLFormElement) {
    const current = verificationFlowQuery.data.value;
    if (!current || submitting.value) return;
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
    submitting,
    submitError,
    clearSubmitError,
    submitVerificationForm,
  };
}
