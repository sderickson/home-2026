<template>
  <v-container
    class="py-8"
    max-width="720"
    v-if="queryData instanceof RegistrationFlowFetched && flow"
  >
    <RegistrationIntro />
    <RegistrationFlowForm :flow="flow" />
  </v-container>
  <v-container
    v-else-if="
      queryData != null && !(queryData instanceof RegistrationFlowFetched)
    "
    class="py-8"
    max-width="720"
  >
    <UnhandledResponsePanel :result="queryData" />
  </v-container>
</template>

<script setup lang="ts">
import { RegistrationFlowFetched } from "@saflib/ory-kratos-sdk";
import { useRegistrationLoader } from "./Registration.loader.ts";
import UnhandledResponsePanel from "../common/UnhandledResponsePanel.vue";
import RegistrationFlowForm from "./RegistrationFlowForm.vue";
import RegistrationIntro from "./RegistrationIntro.vue";
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
