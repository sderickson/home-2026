<template>
  <v-container class="py-8" max-width="720">
    <LoginIntro />
    <!-- <AuthSessionDecisionPanel
      v-if="effectiveSession"
      :identity-email="identityEmail"
      :continue-href="continueHref"
      variant="login"
    /> -->
    <LoginFlowForm v-if="flow" :flow="flow" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { LoginFlowCreated, LoginFlowFetched } from "@saflib/ory-kratos-sdk";
import { useLoginLoader } from "./Login.loader.ts";
import LoginFlowForm from "./LoginFlowForm.vue";
import LoginIntro from "./LoginIntro.vue";
import type { LoginFlow } from "@ory/client";

const { sessionQuery, createLoginFlowQuery, getLoginFlowQuery } =
  useLoginLoader();
const loginResult = computed(
  () => createLoginFlowQuery.data.value ?? getLoginFlowQuery.data.value,
);

const flow = ref<LoginFlow | null>(null);
switch (true) {
  case loginResult.value instanceof LoginFlowCreated:
    flow.value = loginResult.value.flow;
    break;
  case loginResult.value instanceof LoginFlowFetched:
    flow.value = loginResult.value.flow;
    break;
}
</script>
