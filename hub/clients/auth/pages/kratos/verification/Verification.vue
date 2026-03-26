<template>
  <v-container class="py-8" max-width="720">
    <template v-if="session && isVerified">
      <VerificationVerifiedPanel />
    </template>
    <template v-else-if="session && !flow">
      <VerificationIntro variant="request" />
      <v-btn
        color="primary"
        :loading="sendCodePending"
        @click="resendVerificationCode"
      >
        {{ t(introStrings.cta_send_code) }}
      </v-btn>
    </template>
    <template v-else-if="flow">
      <VerificationIntro variant="enter" />
      <VerificationFlowForm :flow="flow" :verification-token="token ?? ''" />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import { identityNeedsEmailVerification } from "@saflib/ory-kratos-sdk";
import VerificationFlowForm from "./VerificationFlowForm.vue";
import VerificationIntro from "./VerificationIntro.vue";
import { verification_intro as introStrings } from "./VerificationIntro.strings.ts";
import VerificationVerifiedPanel from "./VerificationVerifiedPanel.vue";
import { useVerificationLoader } from "./Verification.loader.ts";
import { useVerificationFlow } from "./useVerificationFlow.ts";
import { useRoute } from "vue-router";
import { VerificationFlowFetched } from "@saflib/ory-kratos-sdk";
const { t } = useReverseT();
const route = useRoute();

const { getVerificationFlowQuery, sessionQuery } = useVerificationLoader();
const flow = computed(() => {
  switch (true) {
    case getVerificationFlowQuery.data.value instanceof VerificationFlowFetched:
      return getVerificationFlowQuery.data.value.flow;
  }
});

const token = computed(() => {
  return typeof route.query.token === "string" ? route.query.token : undefined;
});

const { resendVerificationCode, submitting: sendCodePending } =
  useVerificationFlow(token, flow.value?.id ?? "");

const session = computed(() => sessionQuery.data.value);

const isVerified = computed(
  () =>
    session.value != null &&
    !identityNeedsEmailVerification(session.value.identity),
);
</script>
