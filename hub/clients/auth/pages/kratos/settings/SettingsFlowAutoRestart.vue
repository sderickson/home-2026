<template>
  <v-container class="py-8" max-width="720">
    <v-alert type="info" variant="tonal">
      Refreshing account settings...
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const nextQuery: Record<string, string> = {};
  if (typeof route.query.return_to === "string") {
    nextQuery.return_to = route.query.return_to;
  }
  const target = router.resolve({
    path: route.path,
    query: nextQuery,
  });
  window.location.replace(target.href);
});
</script>
