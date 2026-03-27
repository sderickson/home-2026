<template>
  <v-container class="py-8" max-width="720">
    <v-progress-circular indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { useNewRegistrationLoader } from "./NewRegistration.loader.ts";
import { useRouter } from "vue-router";

const { createRegistrationFlowQuery } = useNewRegistrationLoader();
const router = useRouter();

const id = createRegistrationFlowQuery.data.value?.flow.id;
if (id) {
  router.push({
    path: "/registration",
    query: { flow: id },
  });
}
</script>
