<template>
  <v-container class="py-8" max-width="720">
    <v-progress-circular indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { useRouter } from "vue-router";
import type { LoginFlowCreated } from "@saflib/ory-kratos-sdk";

const props = defineProps<{
  result: LoginFlowCreated;
}>();

const router = useRouter();

watchEffect(() => {
  const id = props.result.flow.id;
  if (!id) return;
  router.push({
    path: "/login",
    query: { flow: id },
  });
});
</script>
