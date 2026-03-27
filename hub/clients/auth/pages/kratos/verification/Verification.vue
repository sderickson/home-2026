<template>
  <v-container class="py-8" max-width="720">
    <template v-if="session && isVerified">
      <VerificationVerifiedPanel />
    </template>
    <template v-else-if="session && !flowId && !isVerified">
      <VerificationIntro variant="request" />
      <v-btn
        color="primary"
        tag="a"
        :href="newVerificationHref"
        :aria-label="t(introStrings.cta_send_code)"
      >
        {{ t(introStrings.cta_send_code) }}
      </v-btn>
    </template>
    <template
      v-else-if="
        session &&
        queryData instanceof VerificationFlowFetched &&
        flow
      "
    >
      <VerificationIntro variant="enter" />
      <VerificationFlowForm :flow="flow" :verification-token="token ?? ''" />
    </template>
    <FlowGonePanel
      v-else-if="session && !isVerified && queryData instanceof FlowGone"
      restart-path="/new-verification"
      :result="queryData"
    />
    <UnhandledResponsePanel
      v-else-if="session && !isVerified && flowId"
      :result="queryData"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, toValue } from "vue";
import { useRoute } from "vue-router";
import { useReverseT } from "@sderickson/hub-auth-spa/i18n";
import {
  FlowGone,
  identityNeedsEmailVerification,
  VerificationFlowFetched,
} from "@saflib/ory-kratos-sdk";
import FlowGonePanel from "../common/FlowGonePanel.vue";
import UnhandledResponsePanel from "../common/UnhandledResponsePanel.vue";
import VerificationFlowForm from "./VerificationFlowForm.vue";
import VerificationIntro from "./VerificationIntro.vue";
import { verification_intro as introStrings } from "./VerificationIntro.strings.ts";
import VerificationVerifiedPanel from "./VerificationVerifiedPanel.vue";
import { useVerificationLoader } from "./Verification.loader.ts";
import { useNewVerificationEntryHref } from "./useNewVerificationEntryHref.ts";

const { t } = useReverseT();
const route = useRoute();

const flowId = computed(() =>
  typeof route.query.flow === "string" ? route.query.flow : undefined,
);

const { getVerificationFlowQuery, sessionQuery } = useVerificationLoader();

const queryData = computed(() => toValue(getVerificationFlowQuery.data));

const flow = computed(() => {
  const d = queryData.value;
  if (d instanceof VerificationFlowFetched) {
    return d.flow;
  }
  return null;
});

const token = computed(() =>
  typeof route.query.token === "string" ? route.query.token : undefined,
);

const session = computed(() => sessionQuery.data.value);

const isVerified = computed(
  () =>
    session.value != null &&
    !identityNeedsEmailVerification(session.value.identity),
);

const newVerificationHref = useNewVerificationEntryHref();
</script>
