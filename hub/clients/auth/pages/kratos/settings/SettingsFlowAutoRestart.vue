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
  if (typeof route.query.redirect === "string") {
    nextQuery.redirect = route.query.redirect;
  }
  void router.replace({
    path: route.path,
    query: nextQuery,
  });
});
</script>
