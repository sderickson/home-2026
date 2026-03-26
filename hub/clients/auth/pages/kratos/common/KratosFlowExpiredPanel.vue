<template>
  <v-container class="py-8" max-width="720">
    <v-alert type="info" variant="tonal" class="mb-4">
      {{ message }}
    </v-alert>
    <v-btn color="primary" @click="restart">
      {{ cta }}
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const props = withDefaults(
  defineProps<{
    message: string;
    cta: string;
    preserveQueryKeys?: string[];
  }>(),
  {
    preserveQueryKeys: () => ["redirect"],
  },
);

const route = useRoute();
const router = useRouter();

function restart() {
  const next: Record<string, string> = {};
  for (const key of props.preserveQueryKeys) {
    const value = route.query[key];
    if (typeof value === "string") {
      next[key] = value;
    }
  }
  void router.replace({
    path: route.path,
    query: next,
  });
}
</script>
