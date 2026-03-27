<template>
  <v-container class="py-8" max-width="720">
    <RegistrationFlowForm
      v-if="queryData instanceof RegistrationFlowFetched && flow"
      :flow="flow"
    />
    <FlowGonePanel
      v-else-if="queryData instanceof FlowGone"
      restart-path="/new-registration"
      :result="queryData"
    />
    <UnhandledResponsePanel
      v-else-if="
        queryData != null && !(queryData instanceof RegistrationFlowFetched)
      "
      :result="queryData"
    />
  </v-container>
</template>

<script setup lang="ts">
import { FlowGone, RegistrationFlowFetched } from "@saflib/ory-kratos-sdk";
import { useRegistrationLoader } from "./Registration.loader.ts";
import FlowGonePanel from "../common/FlowGonePanel.vue";
import UnhandledResponsePanel from "../common/UnhandledResponsePanel.vue";
import RegistrationFlowForm from "./RegistrationFlowForm.vue";
import { computed, toValue } from "vue";

const { getRegistrationFlowQuery } = useRegistrationLoader();

const queryData = computed(() => toValue(getRegistrationFlowQuery.data));

const flow = computed(() => {
  const d = queryData.value;
  if (d instanceof RegistrationFlowFetched) {
    return d.flow;
  }
  return null;
});
</script>
