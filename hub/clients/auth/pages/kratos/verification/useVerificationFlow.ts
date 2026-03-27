import { ref, type MaybeRefOrGetter, toValue } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import {
  getVerificationFlowQueryKey,
  useUpdateVerificationFlowMutation,
  VerificationFlowFetched,
  VerificationFlowUpdated,
} from "@saflib/ory-kratos-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import {
  buildVerificationUpdateBodyFromFormData,
  destinationAfterVerification,
  verificationFlowIsComplete,
} from "./Verification.logic.ts";

/**
 * Submit verification steps for an active flow (email → code → done). Starting a browser flow is handled by
 * {@link useNewVerificationEntryHref} / the `/new-verification` route.
 */
export function useVerificationFlow(
  verificationToken: MaybeRefOrGetter<string | undefined>,
  flowId: MaybeRefOrGetter<string>,
) {
  const queryClient = useQueryClient();
  const postAuthFallbackHref = useAuthPostAuthFallbackHref();
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
      const id = toValue(flowId);
      const token = toValue(verificationToken);
      const updated = await updateVerification.mutateAsync({
        flow: id,
        updateVerificationFlowBody: buildVerificationUpdateBodyFromFormData(fd),
        ...(token ? { token } : {}),
      });

      if (!(updated instanceof VerificationFlowUpdated)) {
        throw new Error("Unexpected result");
      }

      queryClient.setQueryData(
        getVerificationFlowQueryKey(id),
        new VerificationFlowFetched(updated.flow),
      );

      if (verificationFlowIsComplete(updated.flow)) {
        window.location.assign(
          destinationAfterVerification(
            updated.flow.return_to,
            postAuthFallbackHref.value,
          ),
        );
      }
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
