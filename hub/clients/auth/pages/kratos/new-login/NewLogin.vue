<template>
  <LoginFlowCreated
    v-if="result instanceof LoginFlowCreatedResult"
    :result="result"
  />
  <SessionAlreadyAvailableComponent
    v-else-if="result instanceof SessionAlreadyAvailable"
  />
</template>

<script setup lang="ts">
import { useNewLoginLoader } from "./NewLogin.loader.ts";
import {
  LoginFlowCreated as LoginFlowCreatedResult,
  SessionAlreadyAvailable,
} from "@saflib/ory-kratos-sdk";
import LoginFlowCreated from "./LoginFlowCreated.vue";
import SessionAlreadyAvailableComponent from "../common/SessionAlreadyAvailable.vue";

const { createLoginFlowQuery } = useNewLoginLoader();
const result = createLoginFlowQuery.data;
</script>
