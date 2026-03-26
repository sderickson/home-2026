<template>
  <v-container class="py-8" max-width="720">
    <RegistrationIntro v-if="!session" />
    <AuthSessionDecisionPanel
      v-if="session"
      :identity-email="identityEmail"
      variant="registration"
    />
    <RegistrationFlowForm v-else-if="flow" :flow="flow" />
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  kratosIdentityEmail,
  RegistrationFlowCreated,
  RegistrationFlowFetched,
} from "@saflib/ory-kratos-sdk";
import AuthSessionDecisionPanel from "../common/AuthSessionDecisionPanel.vue";
import { useRegistrationLoader } from "./Registration.loader.ts";
import RegistrationFlowForm from "./RegistrationFlowForm.vue";
import RegistrationIntro from "./RegistrationIntro.vue";
import type { RegistrationFlow } from "@ory/client";

const { sessionQuery, createRegistrationFlowQuery, getRegistrationFlowQuery } =
  useRegistrationLoader();
const registrationResult = computed(
  () =>
    createRegistrationFlowQuery.data.value ??
    getRegistrationFlowQuery.data.value,
);

const session = computed(() => sessionQuery.data.value);

const identityEmail = computed(() => {
  return kratosIdentityEmail(session.value) || "";
});
const flow = ref<RegistrationFlow | null>(null);

switch (true) {
  case registrationResult.value instanceof RegistrationFlowCreated:
    flow.value = registrationResult.value.flow;
    break;
  case registrationResult.value instanceof RegistrationFlowFetched:
    flow.value = registrationResult.value.flow;
    break;
}
</script>
