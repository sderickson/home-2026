<template>
  <v-container class="py-8" max-width="720">
    <LoginFlowForm
      v-if="
        (queryData instanceof LoginFlowFetched ||
          queryData instanceof LoginFlowCreated) &&
        flow
      "
      :flow="flow"
    />
    <FlowGonePanel
      v-else-if="queryData instanceof FlowGone"
      restart-path="/new-login"
      :result="queryData"
    />
    <SessionAlreadyAvailableComponent
      v-else-if="queryData instanceof SessionAlreadyAvailable"
    />
    <UnhandledResponsePanel v-else :result="queryData" />
  </v-container>
</template>

<script setup lang="ts">
import {
  FlowGone,
  LoginFlowCreated,
  LoginFlowFetched,
  SessionAlreadyAvailable,
} from "@saflib/ory-kratos-sdk";
import { useLoginLoader } from "./Login.loader.ts";
import FlowGonePanel from "../common/FlowGonePanel.vue";
import UnhandledResponsePanel from "../common/UnhandledResponsePanel.vue";
import LoginFlowForm from "./LoginFlowForm.vue";
import SessionAlreadyAvailableComponent from "../common/SessionAlreadyAvailable.vue";
import { computed, toValue } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const flowId = computed(() =>
  typeof route.query.flow === "string" ? route.query.flow : undefined,
);

const { createLoginFlowQuery, getLoginFlowQuery } = useLoginLoader();

const queryData = computed(() =>
  flowId.value
    ? toValue(getLoginFlowQuery.data)
    : toValue(createLoginFlowQuery.data),
);

const flow = computed(() => {
  const d = queryData.value;
  if (d instanceof LoginFlowFetched) return d.flow;
  if (d instanceof LoginFlowCreated) return d.flow;
  return null;
});
</script>
