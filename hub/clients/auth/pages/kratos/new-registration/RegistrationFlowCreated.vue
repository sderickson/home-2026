<template>
  <v-container class="py-8" max-width="720">
    <v-progress-circular indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { useRouter } from "vue-router";
import type { RegistrationFlowCreated } from "@saflib/ory-kratos-sdk";

const props = defineProps<{
  result: RegistrationFlowCreated;
}>();

const router = useRouter();

watchEffect(() => {
  const id = props.result.flow.id;
  if (!id) return;
  router.push({
    path: "/registration",
    query: { flow: id },
  });
});
</script>
