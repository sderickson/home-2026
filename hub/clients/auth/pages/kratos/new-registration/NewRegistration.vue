<template>
  <RegistrationFlowCreated
    v-if="result instanceof RegistrationFlowCreatedResult"
    :result="result"
  />
  <v-container
    v-else-if="result instanceof SessionAlreadyAvailableResult"
    class="py-8"
    max-width="720"
  >
    <SessionAlreadyAvailable />
  </v-container>
  <v-container v-else class="py-8" max-width="720">
    <v-progress-circular indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { useNewRegistrationLoader } from "./NewRegistration.loader.ts";
import {
  RegistrationFlowCreated as RegistrationFlowCreatedResult,
  SessionAlreadyAvailable as SessionAlreadyAvailableResult,
} from "@saflib/ory-kratos-sdk";
import RegistrationFlowCreated from "./RegistrationFlowCreated.vue";
import SessionAlreadyAvailable from "./SessionAlreadyAvailable.vue";

const { createRegistrationFlowQuery } = useNewRegistrationLoader();
const result = createRegistrationFlowQuery.data;
</script>
