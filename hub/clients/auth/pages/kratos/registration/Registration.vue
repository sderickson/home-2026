<template>
  <v-container
    class="py-8"
    max-width="720"
    v-if="
      toValue(getRegistrationFlowQuery.data) instanceof
        RegistrationFlowFetched && flow
    "
  >
    <RegistrationIntro />
    <RegistrationFlowForm :flow="flow" />
  </v-container>
</template>

<script setup lang="ts">
import { RegistrationFlowFetched } from "@saflib/ory-kratos-sdk";
import { useRegistrationLoader } from "./Registration.loader.ts";
import RegistrationFlowForm from "./RegistrationFlowForm.vue";
import RegistrationIntro from "./RegistrationIntro.vue";
import { computed, toValue } from "vue";
const { getRegistrationFlowQuery } = useRegistrationLoader();
const flow = computed(() => {
  if (getRegistrationFlowQuery.data instanceof RegistrationFlowFetched) {
    return getRegistrationFlowQuery.data.flow;
  }
  return null;
});
</script>
