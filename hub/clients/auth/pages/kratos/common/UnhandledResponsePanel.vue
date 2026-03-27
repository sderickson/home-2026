<template>
  <div>
    <h1 class="text-h6 mb-2">Unexpected response</h1>
    <p class="text-body-2 text-medium-emphasis mb-2">
      HTTP status: <code>{{ result.status }}</code>
    </p>
    <pre
      class="text-body-2 pa-4 rounded bg-surface-variant overflow-auto"
      style="white-space: pre-wrap; word-break: break-word"
    >{{ bodyJson }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UnhandledResponse } from "@saflib/ory-kratos-sdk";

const props = defineProps<{
  result: UnhandledResponse;
}>();

const bodyJson = computed(() => {
  try {
    return JSON.stringify(props.result.data, null, 2);
  } catch {
    return String(props.result.data);
  }
});
</script>
