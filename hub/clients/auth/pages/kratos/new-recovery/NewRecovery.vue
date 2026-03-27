<template>
  <v-container class="py-8" max-width="720">
    <RecoveryFlowCreatedView
      v-if="queryData instanceof RecoveryFlowCreatedResult"
      :result="queryData"
    />
    <UnhandledResponsePanel v-else :result="queryData" />
  </v-container>
</template>

<script setup lang="ts">
import { RecoveryFlowCreated as RecoveryFlowCreatedResult } from "@saflib/ory-kratos-sdk";
import { useNewRecoveryLoader } from "./NewRecovery.loader.ts";
import UnhandledResponsePanel from "../common/UnhandledResponsePanel.vue";
import RecoveryFlowCreatedView from "./RecoveryFlowCreated.vue";
import { computed, toValue } from "vue";

const { createRecoveryFlowQuery } = useNewRecoveryLoader();

const queryData = computed(() => toValue(createRecoveryFlowQuery.data));
</script>
