<template>
  <v-container class="py-8" max-width="720">
    <template v-if="session && isVerified">
      <VerificationVerifiedPanel :continue-href="continueAfterHref" />
    </template>
    <template v-else-if="session && needsEmailVerification && !flowIdForForm">
      <VerificationIntro variant="request" />
      <v-btn
        color="primary"
        :loading="sendCodePending"
        @click="startNewBrowserFlow"
      >
        {{ t(introStrings.cta_send_code) }}
      </v-btn>
    </template>
    <template v-else-if="flowIdForForm">
      <VerificationIntro variant="enter" />
      <VerificationFlowForm
        :flow-id="flowIdForForm"
        :browser-return-to="browserReturnTo"
        :verification-token="verificationToken"
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { identityNeedsEmailVerification } from "@sderickson/recipes-sdk";
import { useAuthPostAuthFallbackHref } from "../../../authFallbackInject.ts";
import { destinationAfterVerification } from "./Verification.logic.ts";
import { useVerificationNewBrowserFlow } from "./useVerificationNewBrowserFlow.ts";
import { useVerificationRouteSync } from "./useVerificationRouteSync.ts";
import VerificationFlowForm from "./VerificationFlowForm.vue";
import VerificationIntro from "./VerificationIntro.vue";
import { verification_intro as introStrings } from "./VerificationIntro.strings.ts";
import VerificationVerifiedPanel from "./VerificationVerifiedPanel.vue";
import { useVerificationLoader } from "./Verification.loader.ts";
import type { VerificationFlow } from "@ory/client";
import { ref } from "vue";
import {
  VerificationFlowCreated,
  VerificationFlowFetched,
} from "@sderickson/recipes-sdk";
const { t } = useReverseT();

const { createVerificationFlowQuery, getVerificationFlowQuery } =
  useVerificationLoader();
const verificationResult = computed(
  () =>
    createVerificationFlowQuery.data.value ??
    getVerificationFlowQuery.data.value,
);

const flow = ref<VerificationFlow | null>(null);
switch (true) {
  case verificationResult.value instanceof VerificationFlowCreated:
    flow.value = verificationResult.value.flow;
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?flow=${flow.value?.id}`,
    );
    break;
  case verificationResult.value instanceof VerificationFlowFetched:
    flow.value = verificationResult.value.flow;
    break;
}

const postAuthFallbackHref = useAuthPostAuthFallbackHref();

const { startNewBrowserFlow, pending: sendCodePending } =
  useVerificationNewBrowserFlow();

const session = computed(() => sessionQuery.data.value);

const isVerified = computed(
  () =>
    session.value != null &&
    !identityNeedsEmailVerification(session.value.identity),
);

const needsEmailVerification = computed(
  () =>
    session.value != null &&
    identityNeedsEmailVerification(session.value.identity),
);

const continueAfterHref = computed(() =>
  destinationAfterVerification(
    browserReturnTo.value,
    postAuthFallbackHref.value,
  ),
);
</script>
