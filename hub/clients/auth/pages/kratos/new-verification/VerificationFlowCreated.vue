<template>
  <div class="d-flex justify-center py-4">
    <v-progress-circular indeterminate color="primary" />
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { VerificationFlowCreated } from "@saflib/ory-kratos-sdk";

const props = defineProps<{
  result: VerificationFlowCreated;
}>();

const route = useRoute();
const router = useRouter();

watchEffect(() => {
  const id = props.result.flow.id;
  if (!id) return;
  const next: Record<string, string> = { flow: id };
  for (const key of ["redirect", "return_to", "token"] as const) {
    const v = route.query[key];
    if (typeof v === "string") {
      next[key] = v;
    }
  }
  void router.push({
    path: "/verification",
    query: next,
  });
});
</script>
