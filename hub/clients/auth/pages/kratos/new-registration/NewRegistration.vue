<template>
  <RegistrationFlowCreated
    v-if="result instanceof RegistrationFlowCreatedResult"
    :result="result"
  />
  <SessionAlreadyAvailableComponent
    v-else-if="result instanceof SessionAlreadyAvailable"
    :result="result"
  />
</template>

<script setup lang="ts">
import { useNewRegistrationLoader } from "./NewRegistration.loader.ts";
import {
  RegistrationFlowCreated as RegistrationFlowCreatedResult,
  SessionAlreadyAvailable,
} from "@saflib/ory-kratos-sdk";
import RegistrationFlowCreated from "./RegistrationFlowCreated.vue";
import SessionAlreadyAvailableComponent from "./SessionAlreadyAvailable.vue";

const { createRegistrationFlowQuery } = useNewRegistrationLoader();
const result = createRegistrationFlowQuery.data;
</script>
